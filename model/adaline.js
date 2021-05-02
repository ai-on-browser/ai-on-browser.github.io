class ADALINE {
	// https://qiita.com/ruka38/items/2f2f958c1d45728ea577
	// https://qiita.com/kazukiii/items/958fa06079a0e5a73007
	constructor(rate) {
		this._r = rate
		this._a = x => x
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._y = Matrix.fromArray(train_y)
		this._epoch = 0

		this._w = Matrix.randn(this._x.cols, 1)
		this._b = 0
	}

	fit() {
		const o = this._x.dot(this._w)
		o.map(v => this._a(v + this._b))

		const e = this._y.copySub(o)
		const dw = this._x.tDot(e)
		dw.mult(this._r / this._x.rows)
		this._w.add(dw)
		this._b += e.sum() / this._x.rows
	}

	predict(data) {
		const x = Matrix.fromArray(data)
		return x.dot(this._w).value.map(v => this._a(v + this._b) <= 0 ? -1 : 1)
	}
}

var dispADALINE = function(elm, platform) {
	let model = null
	const calc = (cb) => {
		const method = elm.select("[name=method]").property("value")
		const rate = +elm.select("[name=rate]").property("value");
		platform.fit((tx, ty) => {
			ty = ty.map(v => v[0])
			if (!model) {
				model = new EnsembleBinaryModel(ADALINE, method, null, [rate])
				model.init(tx, ty);
			}
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
		.text(d => d)
	elm.append("span")
		.text(" Learning rate ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "rate")
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
		.attr("value", 0.1)
	platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	}).step(calc).epoch()
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	dispADALINE(platform.setting.ml.configElement, platform)
}
