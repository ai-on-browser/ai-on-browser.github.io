class SezanMethod {
	// https://qiita.com/yuji0001/items/29c02b4fa1506edbdf19
	constructor(gamma = 0.5, sigma = 5) {
		this._gamma = gamma
		this._sigma = sigma
	}

	predict(x) {
		const count = 256
		const max = x.reduce((m, v) => Math.max(m, v), -Infinity)
		const min = x.reduce((m, v) => Math.min(m, v), Infinity)

		const hist = Array(count).fill(0)
		for (let i = 0; i < x.length; i++) {
			if (x[i] === max) {
				hist[count - 1]++
			} else {
				hist[Math.floor((x[i] - min) / (max - min) * count)]++
			}
		}

		const kernel = []
		const ksize = 55
		const ksize2 = Math.floor(ksize / 2)
		let ksum = 0
		for (let i = 0; i < ksize; i++) {
			kernel[i] = Math.exp(-((i - ksize2) ** 2) / (2 * this._sigma ** 2))
			ksum += kernel[i]
		}
		for (let i = 0; i < kernel.length; i++) {
			kernel[i] /= ksum
		}

		const histbar = []
		for (let i = 0; i < hist.length; i++) {
			histbar[i] = 0
			for (let k = i - ksize2; k <= i + ksize2; k++) {
				if (k >= 0 && k < hist.length) {
					histbar[i] += hist[k] * kernel[k - i + ksize2]
				}
			}
		}

		const histdiff = [0]
		for (let i = 1; i < histbar.length; i++) {
			histdiff[i] = histbar[i - 1] - histbar[i]
		}
		histdiff.push(0)

		const m = []
		const es = []
		for (let i = 0; i < histdiff.length - 1; i++) {
			if (histdiff[i + 1] >= 0 && histdiff[i] <= 0) {
				m.push(i)
			}
			if (histdiff[i + 1] <= 0 && histdiff[i] >= 0) {
				es.push(i)
			}
		}
		const m0 = m[0]
		const m1 = m[m.length - 1]

		let s0 = 0
		let e0 = 0
		let s1 = 0
		let e1 = 0
		for (let i = 0; i < es.length; i++) {
			if (es[i] < m0) {
				s0 = es[i]
			} else if (es[i] > m0 && e0 === 0) {
				e0 = es[i]
			}
			if (es[i] < m1) {
				s1 = es[i]
			} else if (es[i] > m1 && e1 === 0) {
				e1 = es[i]
			}
		}

		this._th = ((1 - this._gamma) * e0 + this._gamma * s1 + 0.5) * (max - min) / count + min

		return x.map(v => v < this._th ? 0 : 1)
	}
}

var dispSezan = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const gamma = +elm.select("[name=gamma]").property("value")
			const sigma = +elm.select("[name=sigma]").property("value")
			const model = new SezanMethod(gamma, sigma)
			let y = model.predict(tx.flat(2))
			elm.select("[name=threshold]").text(model._th)
			pred_cb(y.map(v => specialCategory.density(1 - v)))
		}, null, 1);
	}

	elm.append("span")
		.text(" gamma ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "gamma")
		.attr("value", 0.5)
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1)
		.on("change", fitModel)
	elm.append("span")
		.text(" sigma ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "sigma")
		.attr("value", 5)
		.attr("min", 0)
		.attr("max", 10)
		.attr("step", 0.1)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
	elm.append("span")
		.text(" Estimated threshold ")
	elm.append("span")
		.attr("name", "threshold")
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispSezan(platform.setting.ml.configElement, platform);
}
