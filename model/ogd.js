class OnlineGradientDescent {
	// https://olpy.readthedocs.io/en/latest/modules/olpy.classifiers.OGD.html#olpy.classifiers.OGD
	constructor(c = 1, loss = "zero_one") {
		this._c = c
		this._w = null

		this._loss = (t, y) => {
			return t === y ? 0 : 1
		}
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x);
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y;

		this._w = Matrix.zeros(this._x.cols, 1)
		this._t = 1
	}

	update(x, y) {
		const m = Math.sign(this._w.tDot(x).value[0])
		const loss = this._loss(y, m)
		if (loss === 0) return
		const c = this._c / Math.sqrt(this._t)

		this._w.add(x.copyMult(c * y))
		this._t++
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

var dispOGD = function(elm, platform) {
	const calc = (cb) => {
		const method = elm.select("[name=method]").property("value")
		const loss = elm.select("[name=loss]").property("value")
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			const c = +elm.select("[name=c]").property("value")
			const model = new EnsembleBinaryModel(OnlineGradientDescent, method, null, [c, loss])
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
		.attr("name", "loss")
		.selectAll("option")
		.data(["zero_one"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
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
	dispOGD(platform.setting.ml.configElement, platform)
}
