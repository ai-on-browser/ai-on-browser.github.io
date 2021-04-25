import { LowpassFilter } from './lowpass.js'

class ButterworthFilter extends LowpassFilter {
	constructor(n = 2, c = 0.5) {
		super(c)
		this._n = n
	}

	_cutoff(i, c, xr, xi) {
		const d = Math.sqrt(1 + (i / c) ** (2 * this._n))
		return [xr / d, xi / d]
	}
}

var dispButterworth = function(elm, platform) {
	const fitModel = () => {
		const n = +elm.select("[name=n]").property("value")
		const c = +elm.select("[name=c]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new ButterworthFilter(n, c)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
	}

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
