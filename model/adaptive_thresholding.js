class AdaptiveThresholding {
	// https://algorithm.joho.info/image-processing/adaptive-thresholding/
	// https://docs.opencv.org/master/d7/d4d/tutorial_py_thresholding.html
	constructor(method = 'mean', k = 3, c = 2) {
		this._method = method
		this._k = k
		this._c = c
	}

	_kernel() {
		const k = []
		for (let i = 0; i < this._k; k[i++] = Array(this._k).fill(1 / (this._k ** 2)));
		if (this._method === 'gaussian') {
			const g = []
			let gsum = 0
			for (let i = 0; i < this._k; i++) {
				g[i] = Math.exp(-((i - (this._k - 1) / 2) ** 2) / 2)
				gsum += g[i]
			}
			for (let i = 0; i < this._k; i++) {
				for (let j = 0; j < this._k; j++) {
					k[i][j] = g[i] * g[j] / (gsum ** 2)
				}
			}
		}
		return k
	}

	predict(x) {
		const p = []
		const kernel = this._kernel()
		for (let i = 0; i < x.length; i++) {
			p[i] = []
			for (let j = 0; j < x[i].length; j++) {
				const d = x[i][j].length
				const m = Array(d).fill(0)
				let ksum = 0
				for (let s = 0; s < kernel.length; s++) {
					const s0 = i + s - (kernel.length - 1) / 2
					if (s0 < 0 || x.length <= s0) {
						continue
					}
					for (let t = 0; t < kernel[s].length; t++) {
						const t0 = j + t - (kernel[s].length - 1) / 2
						if (t0 < 0 || x[i].length <= t0) {
							continue
						}
						for (let u = 0; u < d; u++) {
							m[u] += kernel[s][t] * x[s0][t0][u]
						}
						ksum += kernel[s][t]
					}
				}
				p[i][j] = m.map((v, u) => x[i][j][u] < v / ksum - this._c ? 0 : 255)
			}
		}
		return p
	}
}

var dispAdaptiveThresholding = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const method = elm.select("[name=method]").property("value")
		const k = +elm.select("[name=k]").property("value")
		const c = +elm.select("[name=c]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new AdaptiveThresholding(method, k, c)
			const y = model.predict(tx)
			pred_cb(y.flat())
		}, 1);
	}

	elm.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["mean", "gaussian"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" k ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("value", 3)
		.attr("min", 3)
		.attr("max", 99)
		.attr("step", 2)
		.on("change", fitModel)
	elm.append("span")
		.text(" c ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("value", 2)
		.attr("min", 0)
		.attr("max", 100)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispAdaptiveThresholding(platform.setting.ml.configElement, platform);
}
