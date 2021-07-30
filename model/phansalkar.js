class PhansalkarThresholding {
	// https://gogowaten.hatenablog.com/entry/2020/05/29/135256
	// https://imagej.net/plugins/auto-local-threshold
	constructor(n = 3, k = 0.25, r = 0.5, p = 2, q = 10) {
		this._n = n
		this._k = k
		this._r = r
		this._p = p
		this._q = q
	}

	predict(x) {
		const offset = Math.floor(this._n / 2)
		const p = []
		for (let i = 0; i < x.length; i++) {
			p[i] = []
			for (let j = 0; j < x[i].length; j++) {
				const nears = []
				for (let s = Math.max(0, i - offset); s <= Math.min(x.length - 1, i + offset); s++) {
					for (let t = Math.max(0, j - offset); t <= Math.min(x[i].length - 1, j + offset); t++) {
						nears.push(x[s][t])
					}
				}
				const n = Matrix.fromArray(nears)
				const mean = n.mean(0)
				const std = n.std(0)
				p[i][j] = mean.value.map((v, u) => {
					const t = v * (1 + this._p * Math.exp(-this._q * v) + this._k * ((std.value[u] / this._r) - 1))
					return x[i][j][u] < t ? 0 : 255
				})
			}
		}
		return p
	}
}

var dispPhansalkarThresholding = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const n = +elm.select("[name=n]").property("value")
		const k = +elm.select("[name=k]").property("value")
		const r = +elm.select("[name=r]").property("value")
		const p = +elm.select("[name=p]").property("value")
		const q = +elm.select("[name=q]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new PhansalkarThresholding(n, k, r, p, q)
			const y = model.predict(tx)
			pred_cb(y.flat())
		}, 1);
	}

	elm.append("span")
		.text(" n ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "n")
		.attr("value", 3)
		.attr("min", 3)
		.attr("max", 99)
		.attr("step", 2)
		.on("change", fitModel)
	elm.append("span")
		.text(" k ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("value", 0.25)
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.01)
		.on("change", fitModel)
	elm.append("span")
		.text(" r ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "r")
		.attr("value", 0.5)
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
		.on("change", fitModel)
	elm.append("span")
		.text(" p ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "p")
		.attr("value", 2)
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
		.on("change", fitModel)
	elm.append("span")
		.text(" q ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "q")
		.attr("value", 10)
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispPhansalkarThresholding(platform.setting.ml.configElement, platform);
}
