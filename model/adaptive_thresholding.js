class AdaptiveThresholding {
	// https://algorithm.joho.info/image-processing/adaptive-thresholding/
	constructor(method = 'mean', k = 3, c = 2) {
		this._method = method
		this._k = k
		this._c = c
	}

	predict(x) {
		const offset = Math.floor(this._k / 2)
		const p = []
		for (let i = 0; i < x.length; i++) {
			p[i] = []
			for (let j = 0; j < x[i].length; j++) {
				const d = x[i][j].length
				const m = Array(d).fill(0)
				let n = 0
				for (let s = Math.max(0, i - offset); s <= Math.min(x.length - 1, i + offset); s++) {
					for (let t = Math.max(0, j - offset); t <= Math.min(x[i].length - 1, j + offset); t++) {
						for (let u = 0; u < d; u++) {
							m[u] += x[s][t][u]
						}
						n++
					}
				}
				p[i][j] = m.map((v, u) => x[i][j][u] < v / n - this._c ? 0 : 255)
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
		.data(["mean"])
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
