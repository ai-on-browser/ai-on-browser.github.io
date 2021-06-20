class RobertsCross {
	// https://fussy.web.fc2.com/algo/image4_edge.htm
	// https://en.wikipedia.org/wiki/Roberts_cross
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
		const k1 = [
			[0, 1],
			[-1, 0]
		]
		const k2 = [
			[1, 0],
			[0, -1]
		]
		const g1 = this._convolute(x, k1)
		const g2 = this._convolute(x, k2)

		const g = []
		for (let i = 0; i < g1.length; i++) {
			g[i] = []
			for (let j = 0; j < g1[i].length; j++) {
				g[i][j] = Math.sqrt(g1[i][j] ** 2 + g2[i][j] ** 2) > this._threshold
			}
		}
		return g
	}
}

var dispRobertsCross = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const th = +elm.select("[name=th]").property("value")
			const model = new RobertsCross(th)
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
		.attr("max", 200)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispRobertsCross(platform.setting.ml.configElement, platform);
}
