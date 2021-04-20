class Laplacian {
	// https://algorithm.joho.info/image-processing/laplacian-filter/
	constructor(th, n = 4) {
		this._threshold = th
		this._n = n
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
		let k = null
		if (this._n === 4) {
			k = [
				[0, 1, 0],
				[1, -4, 1],
				[0, 1, 0]
			]
		} else {
			k = [
				[1, 1, 1],
				[1, -8, 1],
				[1, 1, 1]
			]
		}
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

var dispLaplacian = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const th = +elm.select("[name=th]").property("value")
			const near = +elm.select("[name=near]").property("value")
			const model = new Laplacian(th, near)
			let y = model.predict(tx)
			pred_cb(y.flat())
		}, null, 1);
	}

	elm.append("span")
		.text("Near ");
	elm.append("select")
		.attr("name", "near")
		.on("change", fitModel)
		.selectAll("option")
		.data(["4", "8"])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
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
	dispLaplacian(platform.setting.ml.configElement, platform);
}
