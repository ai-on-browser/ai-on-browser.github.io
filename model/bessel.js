import { LowpassFilter } from './lowpass.js'

class BesselFilter extends LowpassFilter {
	// https://ja.wikipedia.org/wiki/%E3%83%99%E3%83%83%E3%82%BB%E3%83%AB%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF
	// http://okawa-denshi.jp/blog/?th=2009012600
	constructor(n = 2, c = 0.5) {
		super(c)
		this._n = n

		this._coef = []
		for (let k = 0; k <= this._n; k++) {
			let c = 1
			for (let i = 0; i < this._n; i++) {
				c *= 2 * this._n - k - i
				if (i < k) {
					c /= i + 1
				} else {
					c /= 2
				}
			}
			this._coef[k] = c
		}
	}

	_reverse_bessel_polynomial(x) {
		let v = 0
		for (let k = 0; k <= this._n; k++) {
			v += this._coef[k] * x ** k
		}
		return v
	}

	_cutoff(i, c, xr, xi) {
		const d = this._reverse_bessel_polynomial(0) / this._reverse_bessel_polynomial(i / c)
		return [xr * d, xi * d]
	}
}

var dispButterworth = function(elm, platform) {
	const fitModel = () => {
		const n = +elm.select("[name=n]").property("value")
		const c = +elm.select("[name=c]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new BesselFilter(n, c)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
	}

	elm.append("span")
		.text("n")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "n")
		.attr("min", 0)
		.attr("max", 100)
		.attr("value", 2)
		.on("change", fitModel)
	elm.append("span")
		.text("cutoff rate")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("min", 0)
		.attr("max", 1)
		.attr("value", 0.9)
		.attr("step", 0.01)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispButterworth(platform.setting.ml.configElement, platform)
}
