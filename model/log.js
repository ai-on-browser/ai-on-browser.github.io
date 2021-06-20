class LoG {
	// https://algorithm.joho.info/image-processing/laplacian-of-gaussian-filter/
	// https://betashort-lab.com/%E7%94%BB%E5%83%8F%E5%87%A6%E7%90%86/log%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF/
	constructor(th) {
		this._threshold = th
		this._k = 5
		this._s = 3
	}

	_convolute(x, kernel) {
		const a = []
		for (let i = 0; i < x.length; i++) {
			a[i] = []
			for (let j = 0; j < x[i].length; j++) {
				let v = 0
				for (let s = 0; s < kernel.length; s++) {
					let n = i + s - Math.floor(kernel.length / 2)
					n = Math.max(0, Math.min(x.length - 1, n))
					for (let t = 0; t < kernel[s].length; t++) {
						let m = j + t - Math.floor(kernel[s].length / 2)
						m = Math.max(0, Math.min(x[n].length - 1, m))
						v += x[n][m] * kernel[s][t]
					}
				}
				a[i][j] = v
			}
		}
		return a
	}

	predict(x) {
		for (let i = 0; i < x.length; i++) {
			for (let j = 0; j < x[i].length; j++) {
				let v = x[i][j].reduce((s, v) => s + v, 0) / x[i][j].length
				x[i][j] = v
			}
		}
		const k = [
			[0, 0, 1, 0, 0],
			[0, 1, 2, 1, 0],
			[1, 2, -16, 2, 1],
			[0, 1, 2, 1, 0],
			[0, 0, 1, 0, 0]
		]
		const gl = this._convolute(x, k)

		const g = []
		for (let i = 0; i < gl.length; i++) {
			g[i] = []
			for (let j = 0; j < gl[i].length; j++) {
				g[i][j] = gl[i][j] > this._threshold
			}
		}
		return g
	}
}

var dispLoG = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const th = +elm.select("[name=th]").property("value")
			const model = new LoG(th)
			let y = model.predict(tx)
			pred_cb(y.flat())
		}, 1);
	}

	elm.append("span")
		.text(" threshold ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "th")
		.attr("value", 50)
		.attr("min", 0)
		.attr("max", 255)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispLoG(platform.setting.ml.configElement, platform);
}
