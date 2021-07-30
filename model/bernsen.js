class BernsenThresholding {
	// https://gogowaten.hatenablog.com/entry/2020/05/29/135256
	// https://imagej.net/plugins/auto-local-threshold
	constructor(n = 3, ct = 15) {
		this._n = n
		this._ct = ct
		this._th = 128
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
				const max = n.max(0)
				const min = n.min(0)
				const lc = max.copySub(min)
				const mid = max.copyAdd(min)
				mid.div(2)
				p[i][j] = lc.value.map((v, u) => {
					if (v < this._ct) {
						return mid.value[u] >= this._th ? 255 : 0
					} else {
						return x[i][j][u] >= mid.value[u] ? 255 : 0
					}
				})
			}
		}
		return p
	}
}

var dispBernsenThresholding = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const n = +elm.select("[name=n]").property("value")
		const ct = +elm.select("[name=ct]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			const model = new BernsenThresholding(n, ct)
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
		.text(" contrast threshold ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "ct")
		.attr("value", 50)
		.attr("min", 0)
		.attr("max", 255)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispBernsenThresholding(platform.setting.ml.configElement, platform);
}
