class NiblackThresholding {
	// https://schima.hatenablog.com/entry/2013/10/19/085019
	// https://www.kite.com/python/docs/skimage.filters.threshold_niblack
	constructor(n = 3, k = 0.1) {
		this._n = n
		this._k = k
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
				const m = n.mean(0)
				const s = n.std(0)
				s.mult(this._k)
				p[i][j] = m.copySub(s).value.map((v, u) => x[i][j][u] < v ? 0 : 255)
			}
		}
		return p
	}
}

var dispNiblackThresholding = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const n = +elm.select("[name=n]").property("value")
		const k = +elm.select("[name=k]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new NiblackThresholding(n, k)
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
		.attr("value", 0.1)
		.attr("min", -100)
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
	dispNiblackThresholding(platform.setting.ml.configElement, platform);
}
