class Prewitt {
	// http://www.mis.med.akita-u.ac.jp/~kata/image/sobelprew.html
	constructor(th) {
		this._threshold = th
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
		const gx = this._convolute(x, [
			[1, 0, -1],
			[1, 0, -1],
			[1, 0, -1]
		])
		const gy = this._convolute(x, [
			[1, 1, 1],
			[0, 0, 0],
			[-1, -1, -1]
		])

		const g = []
		for (let i = 0; i < gx.length; i++) {
			g[i] = []
			for (let j = 0; j < gx[i].length; j++) {
				g[i][j] = Math.sqrt(gx[i][j] ** 2 + gy[i][j] ** 2) > this._threshold
			}
		}
		return g
	}
}

var dispPrewitt = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const th = +elm.select("[name=th]").property("value")
			const model = new Prewitt(th)
			let y = model.predict(tx)
			pred_cb(y.flat())
		}, null, 1);
	}

	elm.append("span")
		.text(" threshold ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "th")
		.attr("value", 200)
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
	dispPrewitt(platform.setting.ml.configElement, platform);
}
