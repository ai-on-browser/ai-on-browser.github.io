class QuantileRegression {
	// https://salad-bowl-of-knowledge.github.io/hp/statistics/2020/01/21/quantile_regression.html
	// https://en.wikipedia.org/wiki/Quantile_regression
	constructor(tau = 0.5, learningRate = 0.1) {
		this._tau = tau
		this._lr = learningRate
		this._w = null
	}

	set lr(value) {
		this._lr = value
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const n = x.rows
		const xh = x.resize(n, x.cols + 1, 1);

		if (this._w === null) {
			this._w = Matrix.randn(xh.cols, y.cols)
		}

		const p = xh.dot(this._w)
		const d = y.copySub(p)
		const indicator = d.copyMap(v => v <= 0 ? 1 : 0)
		const g = indicator.copySub(this._tau)
		g.map(v => Math.abs(v))
		g.mult(d.copyMap(v => Math.sign(v)))
		const dw = xh.tDot(g)
		dw.mult(this._lr)

		this._w.add(dw)
	}

	predict(x) {
		x = Matrix.fromArray(x)
		let xh = x.resize(x.rows, x.cols + 1, 1);
		return xh.dot(this._w).toArray()
	}
}

var dispQuantile = function(elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const t = +elm.select("[name=t]").property("value")
			const lr = +elm.select("[name=lr]").property("value")
			if (!model) {
				model = new QuantileRegression(t, lr)
			}
			model.lr = lr
			model.fit(tx, ty);

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px);
				pred_cb(pred);
			}, 4)
		});
	};

	elm.append("span")
		.text(" t ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "t")
		.attr("value", 0.5)
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	elm.append("span")
		.text(" learning rate ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "lr")
		.attr("value", 0.001)
		.attr("min", 0)
		.attr("max", 10)
		.attr("step", 0.001)
	slbConf.step(fitModel).epoch()
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispQuantile(platform.setting.ml.configElement, platform)
}
