class KolmogorovZurbenkoFilter {
	// https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Zurbenko_filter
	constructor(m, k) {
		this._m = m
		this._k = k
	}

	_ma(x) {
		const p = []
		const d = x[0].length
		for (let i = 0; i < x.length; i++) {
			const t = Math.min(this._m, i + 1)
			p[i] = Array(d).fill(0)
			for (let k = i - t + 1; k <= i; k++) {
				for (let j = 0; j < d; j++) {
					p[i][j] += x[k][j]
				}
			}
			for (let j = 0; j < d; j++) {
				p[i][j] /= t
			}
		}
		return p
	}

	predict(x) {
		let p = x
		for (let i = 0; i < this._k; i++) {
			p = this._ma(p)
		}
		return p
	}
}

var dispKZ = function(elm, platform) {
	const fitModel = () => {
		const m = +elm.select("[name=m]").property("value")
		const k = +elm.select("[name=k]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new KolmogorovZurbenkoFilter(m, k)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
	}

	elm.append("span")
		.text("m")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "m")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 5)
		.on("change", fitModel)
	elm.append("span")
		.text("k")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 2)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispKZ(platform.setting.ml.configElement, platform)
}
