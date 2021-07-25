class HampelFilter {
	// https://jp.mathworks.com/help/signal/ref/hampel.html
	// https://towardsdatascience.com/outlier-detection-with-hampel-filter-85ddf523c73d
	// https://cpp-learning.com/hampel-filter/
	constructor(k = 3, th = 3) {
		this._k = k
		this._th = th
	}

	_median(a) {
		a.sort((a, b) => a - b)
		const n = a.length
		if (n % 2 === 1) {
			return a[(n - 1) / 2]
		}
		return (a[n / 2] + a[n / 2 - 1]) / 2
	}

	_predict(x) {
		const p = []
		for (let i = 0; i < x.length; i++) {
			const s = Math.max(0, i - this._k)
			const e = Math.min(x.length - 1, i + this._k)
			const target = x.slice(s, e + 1)
			const mid = this._median(target)
			const std = 1.4826 * this._median(target.map(v => Math.abs(v - mid)))

			if (Math.abs(x[i] - mid) > this._th * std) {
				p.push(mid)
			} else {
				p.push(x[i])
			}
		}
		return p
	}

	predict(x) {
		const p = []
		for (let i = 0; i < x.length; i++) {
			p[i] = []
		}
		for (let d = 0; d < x[0].length; d++) {
			const pd = this._predict(x.map(v => v[d]))
			for (let i = 0; i < x.length; i++) {
				p[i][d] = pd[i]
			}
		}
		return p
	}
}

var dispHampel = function(elm, platform) {
	const fitModel = () => {
		const k = +elm.select("[name=k]").property("value")
		const th = +elm.select("[name=th]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new HampelFilter(k, th)
			const pred = model.predict(tx)
			pred_cb(pred)
		})
	}

	elm.append("span")
		.text("k")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 3)
		.on("change", fitModel)
	elm.append("span")
		.text(" threshold ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "th")
		.attr("min", 0)
		.attr("max", 10)
		.attr("value", 3)
		.attr("step", 0.1)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispHampel(platform.setting.ml.configElement, platform)
}
