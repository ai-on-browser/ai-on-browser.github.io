class BayesianLinearRegression {
	// https://qiita.com/tshimizu8/items/e5f2320ce02973a19563
	constructor(lambda = 0.1, sigma = 0.2) {
		this._w = null
		this._lambda = lambda
		this._sigma = sigma
		this._m = null
		this._s = null
		this._beta = 1 / (sigma ** 2)
		this._alpha = lambda * this._beta
	}

	_init(x, y) {
		this._m = Matrix.zeros(x.cols + 1, y.cols)
		this._s = Matrix.eye(x.cols + 1, x.cols + 1, 1 / this._alpha)
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		if (!this._m) {
			this._init(x, y)
		}
		const xh = x.resize(x.rows, x.cols + 1, 1);
		for (let i = 0; i < x.rows; i++) {
			const xi = xh.row(i)
			const sinv = this._s.inv()
			const pp = xi.tDot(xi)
			pp.mult(this._beta)
			pp.add(sinv)
			this._s = pp.inv()

			const mm = xi.tDot(y.row(i))
			mm.mult(this._beta)
			mm.add(sinv.dot(this._m))
			this._m = this._s.dot(mm)
		}
		this._w = this._m
	}

	predict(x) {
		x = Matrix.fromArray(x)
		let xh = x.resize(x.rows, x.cols + 1, 1)
		return xh.dot(this._w).value
	}
}

var dispBayesianLinearRegression = function(elm, platform) {
	let model
	const fitModel = (cb) => {
		platform.fit((tx, ty, fit_cb) => {
			if (!model) {
				const l = +elm.select("[name=lambda]").property("value")
				const s = +elm.select("[name=sigma]").property("value")
				model = new BayesianLinearRegression(l, s)
			}
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px)
				pred_cb(pred)
				cb && cb()
			}, 4)
		});
	};

	elm.append("select")
		.selectAll("option")
		.data(["online"])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("span")
		.text("lambda = ");
	elm.append("input")
		.attr("name", "lambda")
		.attr("type", "number")
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
		.attr("value", 0.1)
	elm.append("span")
		.text("sigma = ");
	elm.append("input")
		.attr("name", "sigma")
		.attr("type", "number")
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
		.attr("value", 0.2)
	platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	}).step(fitModel).epoch()
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispBayesianLinearRegression(platform.setting.ml.configElement, platform);
}
