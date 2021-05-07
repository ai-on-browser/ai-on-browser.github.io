class ALMA {
	// https://www.jmlr.org/papers/volume2/gentile01a/gentile01a.pdf
	// A New Approximate Maximal Margin Classification Algorithm. (2001)
	constructor(p = 2, alpha = 1, b = 1, c = 1) {
		this._p = p
		this._alpha = alpha
		this._b = b
		this._c = c
		this._w = null
		this._k = 1
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x);
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y;

		this._w = Matrix.zeros(this._x.cols, 1)
		this._k = 1
	}

	update(x, y) {
		const gamma = this._b * Math.sqrt((this._p - 1) / this._k)
		const m = this._w.tDot(x).value[0]
		if (m * y > (1 - this._alpha) * gamma) return

		const eta = this._c / Math.sqrt((this._p - 1) * this._k)
		const dw = x.copyMult(eta * y)
		dw.add(this._w)

		const norm = dw.value.reduce((s, v) => s + v ** this._p, 0) ** (1 / this._p)
		dw.div(Math.max(1, norm))
		this._w = dw
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._shift)
		const r = x.dot(this._w);
		return r.value
	}
}

var dispALMA = function(elm, platform) {
	const calc = (cb) => {
		const method = elm.select("[name=method]").property("value")
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const p = +elm.select("[name=p]").property("value")
			const alpha = +elm.select("[name=alpha]").property("value")
			const b = +elm.select("[name=b]").property("value")
			const c = +elm.select("[name=c]").property("value")
			const model = new EnsembleBinaryModel(ALMA, method, null, [p, alpha, b, c])
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
		.text(" p = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "p")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 2)
	elm.append("span")
		.text(" alpha = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "alpha")
		.attr("min", 0)
		.attr("max", 1)
		.attr("value", 1)
		.attr("step", 0.1)
	elm.append("span")
		.text(" b = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "b")
		.attr("min", 0)
		.attr("max", 100)
		.attr("value", 1)
		.attr("step", 0.1)
	elm.append("span")
		.text(" c = ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("min", 0)
		.attr("max", 100)
		.attr("value", 1)
		.attr("step", 0.1)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispALMA(platform.setting.ml.configElement, platform)
}
