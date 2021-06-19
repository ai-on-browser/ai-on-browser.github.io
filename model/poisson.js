class PoissonRegression {
	// https://en.wikipedia.org/wiki/Poisson_regression
	// https://oku.edu.mie-u.ac.jp/~okumura/stat/poisson_regression.html
	constructor(rate) {
		this._w = null;
		this._r = rate
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		x = x.resize(x.rows, x.cols + 1, 1)
		y = Matrix.fromArray(y)
		if (!this._w) {
			this._w = Matrix.randn(x.cols, y.cols)
		}

		const dw1 = x.tDot(y)
		const dw2 = x.dot(this._w)
		dw2.map(v => Math.exp(v))
		dw1.sub(x.tDot(dw2))
		dw1.mult(this._r / x.rows)
		
		this._w.add(dw1)
	}

	predict(x) {
		x = Matrix.fromArray(x)
		x = x.resize(x.rows, x.cols + 1, 1)
		return x.dot(this._w).copyMap(v => Math.exp(v)).toArray()
	}
}

var dispPoisson = function(elm, platform) {
	let model = null
	const fitModel = (cb) => {
		const rate = +elm.select("[name=rate]").property("value");
		platform.fit((tx, ty) => {
			if (!model) {
				model = new PoissonRegression(rate)
			}
			model.fit(tx, ty);

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px)
				pred_cb(pred);
				cb && cb()
			}, 4)
		});
	};

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
	}).step(fitModel).epoch()
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Step" button.'
	dispPoisson(platform.setting.ml.configElement, platform)
}
