class SecondOrderPerceptron {
	// http://www.datascienceassn.org/sites/default/files/Second-order%20Perception%20Algorithm.pdf
	// A SECOND-ORDER PERCEPTRON ALGORITHM. (2005)
	constructor(a = 1) {
		this._v = null
		this._s = null
		this._a = a
	}

	_w() {
		const s = Matrix.eye(this._d, this._d, this._a)
		s.add(this._s.dot(this._s.t))
		return s.slove(this._v)
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x);
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y;

		this._d = this._x.cols
		this._v = Matrix.zeros(this._d, 1)
		this._s = Matrix.zeros(this._d, 0)
	}

	update(x, y) {
		this._s = this._s.concat(x, 1)
		const w = this._w()
		const m = w.tDot(x).value[0]
		if (m * y > 0) return

		this._v.add(x.copyMult(y))
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._shift)
		const r = x.dot(this._w());
		return r.value
	}
}

var dispSOP = function(elm, platform) {
	const calc = (cb) => {
		const method = elm.select("[name=method]").property("value")
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const a = +elm.select("[name=a]").property("value")
			const model = new EnsembleBinaryModel(SecondOrderPerceptron, method, null, [a])
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
	elm.append("span")
		.text(" a = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "a")
		.attr("min", 0)
		.attr("max", 10)
		.attr("value", 1)
		.attr("step", 0.1)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSOP(platform.setting.ml.configElement, platform)
}
