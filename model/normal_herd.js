class NormalHERD {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.1059.5999&rep=rep1&type=pdf
	// Learning via Gaussian Herding. (2010)
	constructor(type = 'exact', c = 0.1) {
		this._m = null
		this._s = null
		this._c = c
		this._method = type
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x);
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y;

		this._d = this._x.cols
		this._m = Matrix.zeros(this._d, 1)
		this._s = Matrix.eye(this._d, this._d)
	}

	update(x, y) {
		const m = this._m.tDot(x).value[0]
		if (m * y > 1) return

		const v = x.tDot(this._s).dot(x).value[0]
		const alpha = Math.max(0, 1 - m * y) / (v + 1 / this._c)
		const dm = this._s.dot(x)
		dm.mult(y * alpha)
		this._m.add(dm)

		if (this._method === 'full') {
			const ds = this._s.dot(x).dot(x.tDot(this._s))
			ds.mult((this._c ** 2 * v + 2 * this._c) / (1 + this._c * v) ** 2)
			this._s.sub(ds)
		} else if (this._method === 'exact') {
			for (let r = 0; r < this._s.rows; r++) {
				const sr = this._s.at(r, r)
				const xr = x.at(r, 0)
				this._s.set(r, r, sr / (1 + this._c * xr ** 2 * sr) ** 2)
			}
		} else if (this._method === 'project') {
			const xsx = 2 * this._c + this._c ** 2 * v
			for (let r = 0; r < this._s.rows; r++) {
				const sr = this._s.at(r, r)
				const xr = x.at(r, 0)
				this._s.set(r, r, 1 / (1 / sr + xsx * xr ** 2))
			}
		} else if (this._method === 'drop') {
			const xsx = 2 * this._c + this._c ** 2 * v
			for (let r = 0; r < this._s.rows; r++) {
				const sr = this._s.at(r, r)
				const xr = x.at(r, 0)
				this._s.set(r, r, sr - (sr * xr) ** 2 * xsx / (1 + this._c * v) ** 2)
			}
		}
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

var dispNormalHERD = function(elm, platform) {
	const calc = (cb) => {
		const method = elm.select("[name=method]").property("value")
		const type = elm.select("[name=type]").property("value")
		const c = +elm.select("[name=c]").property("value")
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const model = new EnsembleBinaryModel(NormalHERD, method, null, [type, c])
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
		.data(["oneone", "onerest"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("select")
		.attr("name", "type")
		.selectAll("option")
		.data(["full", "exact", "project", "drop"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d)
	elm.append("span")
		.text(" c = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("min", 0)
		.attr("max", 10)
		.attr("value", 0.1)
		.attr("step", 0.1)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispNormalHERD(platform.setting.ml.configElement, platform)
}
