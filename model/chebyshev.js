import { LowpassFilter } from './lowpass.js'

class ChebyshevFilter extends LowpassFilter {
	constructor(type = 1, ripple = 1, n = 2, c = 0.5) {
		super(c)
		this._type = type
		this._n = n
		this._e = ripple
	}

	_chebyshev(n, x) {
		switch (n) {
			case 0:
				return 1
			case 1:
				return x
			case 2:
				return 2 * x ** 2 - 1
			case 3:
				return 4 * x ** 3 - 3 * x
		}
		return 2 * x * this._chebyshev(n - 1, x) - this._chebyshev(n - 2, x)
	}

	_cutoff(i, c, xr, xi) {
		const d = this._type === 1
			? Math.sqrt(1 + (this._e * this._chebyshev(this._n, i / c)) ** 2)
			: Math.sqrt(1 + 1 / ((this._e * this._chebyshev(this._n, c / i)) ** 2))
		return [xr / d, xi / d]
	}
}

var dispChebyshev = function(elm, platform) {
	const fitModel = () => {
		const type = elm.select("[name=type]").property("value") === "first" ? 1 : 2
		const n = +elm.select("[name=n]").property("value")
		const ripple = +elm.select("[name=ripple]").property("value")
		const c = +elm.select("[name=c]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new ChebyshevFilter(type, ripple, n, c)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
	}

	elm.append("span")
		.text("type")
	elm.append("select")
		.attr("name", "type")
		.on("change", fitModel)
		.selectAll("option")
		.data(["first", "second"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text("n")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "n")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 2)
		.on("change", fitModel)
	elm.append("span")
		.text("ripple")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "ripple")
		.attr("min", 0)
		.attr("max", 10)
		.attr("value", 1)
		.attr("step", 0.1)
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
	dispChebyshev(platform.setting.ml.configElement, platform)
}
