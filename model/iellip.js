class CELLIP {
	// https://icml.cc/Conferences/2009/papers/472.pdf
	// Online Learning by Ellipsoid Method.
	constructor(gamma = 0.1, a = 0.5) {
		this._m = null
		this._s = null
		this._gamma = gamma
		this._a = a
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x);
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y;

		this._d = this._x.cols
		this._m = Matrix.zeros(this._d, 1)
		this._p = Matrix.eye(this._d, this._d, (1 + (1 - this._a) * this._gamma))
	}

	update(x, y) {
		const m = this._m.tDot(x).value[0]
		if (m * y > 0) return

		const v = Math.sqrt(x.tDot(this._p).dot(x).value[0])
		const alpha = (this._a * this._gamma - y * m) / v
		const g = x.copyMult(y / v)
		const dm = this._p.dot(g)
		dm.mult(alpha)
		this._m.add(dm)

		const p = this._p.dot(g).dot(g.tDot(this._p))
		p.mult(-2 * alpha * (1 - this._a))
		p.add(this._p.copyMult(1 - alpha ** 2))
		this._p = p
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._shift)
		const r = x.dot(this._m);
		return r.value
	}
}

class IELLIP {
	// https://icml.cc/Conferences/2009/papers/472.pdf
	// Online Learning by Ellipsoid Method.
	// https://olpy.readthedocs.io/en/latest/modules/olpy.classifiers.html
	// https://github.com/LIBOL/LIBOL/blob/master/algorithms/IELLIP.m
	constructor(b = 0.9, c = 0.5) {
		this._m = null
		this._p = null
		this._b = b
		this._c = c
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x);
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y;

		this._d = this._x.cols
		this._m = Matrix.zeros(this._d, 1)
		this._p = Matrix.eye(this._d, this._d)

		this._t = 0
	}

	update(x, y) {
		const m = this._m.tDot(x).value[0]
		if (m * y > 0) return

		const v = Math.sqrt(x.tDot(this._p).dot(x).value[0])
		const alpha = (1 - y * m) / v
		const g = x.copyMult(y / v)
		const ct = this._c * (this._b ** (this._t++))

		const dm = this._p.dot(g)
		dm.mult(alpha)
		this._m.add(dm)

		const p = this._p.dot(g).dot(g.tDot(this._p))
		p.mult(-ct)
		p.add(this._p)
		p.mult(1 / (1 - ct))
		this._p = p
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._shift)
		const r = x.dot(this._m);
		return r.value
	}
}

var dispCELLIP = function(elm, platform) {
	const calc = (cb) => {
		const method = elm.select("[name=method]").property("value")
		const type = elm.select("[name=type]").property("value")
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			let model
			if (type === "CELLIP") {
				const gamma = +elm.select("[name=gamma]").property("value")
				const a = +elm.select("[name=a]").property("value")
				model = new EnsembleBinaryModel(CELLIP, method, null, [gamma, a])
			} else {
				const b = +elm.select("[name=b]").property("value")
				const c = +elm.select("[name=c]").property("value")
				model = new EnsembleBinaryModel(IELLIP, method, null, [b, c])
			}
			model.init(tx, ty);
			model.fit()

			platform.predict((px, pred_cb) => {
				const categories = model.predict(px);
				pred_cb(categories)
				cb && cb()
			}, 3)
		})
	}

	elm.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["oneone", "oneall"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("select")
		.attr("name", "type")
		.on("change", () => {
			const type = elm.select("[name=type]").property("value")
			elm.selectAll(".params").style("display", "none")
			elm.selectAll(`.${type.toLowerCase()}`).style("display", null)
		})
		.selectAll("option")
		.data(["CELLIP", "IELLIP"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d)
	const cel = elm.append("span")
		.classed("params", true)
		.classed("cellip", true)
	cel.append("span")
		.text(" gamma = ")
	cel.append("input")
		.attr("type", "number")
		.attr("name", "gamma")
		.attr("min", 0)
		.attr("max", 10)
		.attr("value", 1)
		.attr("step", 0.1)
	cel.append("span")
		.text(" a = ")
	cel.append("input")
		.attr("type", "number")
		.attr("name", "a")
		.attr("min", 0)
		.attr("max", 1)
		.attr("value", 0.5)
		.attr("step", 0.1)
	const iel = elm.append("span")
		.classed("params", true)
		.classed("iellip", true)
		.style("display", "none")
	iel.append("span")
		.text(" b = ")
	iel.append("input")
		.attr("type", "number")
		.attr("name", "b")
		.attr("min", 0)
		.attr("max", 1)
		.attr("value", 0.5)
		.attr("step", 0.1)
	iel.append("span")
		.text(" c = ")
	iel.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("min", 0)
		.attr("max", 1)
		.attr("value", 0.5)
		.attr("step", 0.1)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispCELLIP(platform.setting.ml.configElement, platform)
}
