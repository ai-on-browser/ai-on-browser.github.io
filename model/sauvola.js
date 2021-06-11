class SauvolaThresholding {
	// https://schima.hatenablog.com/entry/2013/10/19/085019
	constructor(n = 3, k = 0.1, r = 1) {
		this._n = n
		this._k = k
		this._r = r
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
				s.map(v => 1 + this._k * (v / this._r - 1))
				p[i][j] = m.copyMult(s).value.map((v, u) => x[i][j][u] < v ? 0 : 255)
			}
		}
		return p
	}
}

var dispSauvolaThresholding = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const n = +elm.select("[name=n]").property("value")
		const k = +elm.select("[name=k]").property("value")
		const r = +elm.select("[name=r]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new SauvolaThresholding(n, k, r)
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
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
		.on("change", fitModel)
	elm.append("span")
		.text(" R ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "r")
		.attr("value", 5)
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
	dispSauvolaThresholding(platform.setting.ml.configElement, platform);
}
