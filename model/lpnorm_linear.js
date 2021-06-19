import { BasisFunctions } from './least_square.js'

class LpNormLinearRegression {
	// https://en.wikipedia.org/wiki/Iteratively_reweighted_least_squares
	constructor(p = 2) {
		this._p = p
		this._b = null
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)

		if (!this._w) {
			this._w = Matrix.ones(x.rows, 1)
		}

		const xtw = x.copyMult(this._w)
		this._b = xtw.tDot(x).slove(xtw.tDot(y))

		if (this._p - 2 !== 0) {
			const p = x.dot(this._b)
			const d = y.copySub(p)
			d.map(Math.abs)
	
			this._w = d.sum(1)
			if (this._p - 2 < 0) {
				this._w.map(v => Math.max(1.0e-8, v) ** (this._p - 2))
			} else {
				this._w.map(v => v ** (this._p - 2))
			}
		}
	}

	predict(x) {
		x = Matrix.fromArray(x)
		return x.dot(this._b).toArray()
	}
}

var dispLpNormLinearRegression = function(elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty) => {
			if (!model) {
				const p = elm.select("[name=p]").property("value")
				model = new LpNormLinearRegression(p)
			}
			model.fit(basisFunctions.apply(tx), ty);

			platform.predict((px, pred_cb) => {
				let pred = model.predict(basisFunctions.apply(px));
				pred_cb(pred);
			}, 4)
		});
	};

	const basisFunctions = new BasisFunctions(platform)
	basisFunctions.makeHtml(elm)

	elm.append("span").text("p")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "p")
		.attr("min", 0)
		.attr("max", 10)
		.attr("value", 1)
		.attr("step", 0.1)
	platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	}).step(fitModel).epoch()
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLpNormLinearRegression(platform.setting.ml.configElement, platform)
}
