class Canny {
	// http://steavevaivai.hatenablog.com/entry/2018/07/15/005032
	constructor(th1, th2) {
		this._bigth = th1
		this._smlth = th2
	}

	_convolute(x, kernel) {
		const a = []
		for (let i = 0; i < x.length; i++) {
			a[i] = []
			for (let j = 0; j < x[i].length; j++) {
				let v = 0
				for (let s = 0; s < kernel.length; s++) {
					const n = i + s - Math.floor(kernel.length / 2)
					if (n < 0 || x.length <= n) {
						continue
					}
					for (let t = 0; t < kernel[s].length; t++) {
						const m = j + t - Math.floor(kernel[s].length / 2)
						if (m < 0 || x[n].length <= m) {
							continue
						}
						v += x[n][m] * kernel[s][t]
					}
				}
				a[i][j] = v
			}
		}
		return a
	}

	_gaussian(x) {
		const kernel = [
			[1 / 16, 2 / 16, 1 / 16],
			[2 / 16, 4 / 16, 2 / 16],
			[1 / 16, 2 / 16, 1 / 16]
		]
		return this._convolute(x, kernel)
	}

	predict(x) {
		for (let i = 0; i < x.length; i++) {
			for (let j = 0; j < x[i].length; j++) {
				let v = x[i][j].reduce((s, v) => s + v, 0) / x[i][j].length
				x[i][j] = v
			}
		}
		x = this._gaussian(x)
		const gx = this._convolute(x, [
			[1, 0, -1],
			[2, 0, -2],
			[1, 0, -1]
		])
		const gy = this._convolute(x, [
			[1, 2, 1],
			[0, 0, 0],
			[-1, -2, -1]
		])

		const g = []
		const t = []
		for (let i = 0; i < gx.length; i++) {
			g[i] = []
			t[i] = []
			for (let j = 0; j < gx[i].length; j++) {
				g[i][j] = Math.sqrt(gx[i][j] ** 2 + gy[i][j] ** 2)
				t[i][j] = Math.atan2(gy[i][j], gx[i][j])
			}
		}
		const s = []
		for (let i = 0; i < g.length; i++) {
			s[i] = []
			for (let j = 0; j < g[i].length; j++) {
				if (i === 0 || i === g.length - 1 || j === 0 || j === g[i].length - 1) {
					s[i][j] = 0
					continue
				}
				s[i][j] = g[i][j]
				const tv = t[i][j]
				if (-22.5 <= tv && tv < 22.5 || 157.5 <= tv || tv < -157.5) {
					if (g[i][j] < g[i][j - 1] || g[i][j] < g[i][j + 1]) {
						s[i][j] = 0
					}
				} else if (22.5 <= tv && tv < 67.5 || -157.5 <= tv && tv < -112.5) {
					if (g[i][j] < g[i + 1][j - 1] || g[i][j] < g[i - 1][j + 1]) {
						s[i][j] = 0
					}
				} else if (67.5 <= tv && tv < 112.5 || -112.5 <= tv && tv < -67.5) {
					if (g[i][j] < g[i + 1][j] || g[i][j] < g[i - 1][j]) {
						s[i][j] = 0
					}
				} else if (112.5 <= tv && tv < 157.5 || -67.5 <= tv && tv < -22.5) {
					if (g[i][j] < g[i + 1][j + 1] || g[i][j] < g[i - 1][j - 1]) {
						s[i][j] = 0
					}
				}
			}
		}
		const e = []
		for (let i = 0; i < s.length; i++) {
			e[i] = Array(s[i].length).fill(false)
		}
		for (let i = 0; i < s.length; i++) {
			for (let j = 0; j < s[i].length; j++) {
				if (s[i][j] >= this._bigth) {
					const stack = [[i, j]]
					while (stack.length > 0) {
						const [pi, pj] = stack.pop()
						if (pi < 0 || s.length <= pi || pj < 0 || s[pi].length <= pj) {
							continue
						}
						if (e[pi][pj]) {
							continue
						}
						if (s[pi][pj] < this._smlth) {
							continue
						}
						e[pi][pj] = true
						stack.push([pi + 1, pj], [pi - 1, pj], [pi, pj + 1], [pi, pj - 1])
					}
				}
			}
		}
		return e
	}
}

var dispCanny = function(elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const th1 = +elm.select("[name=th1]").property("value")
			const th2 = +elm.select("[name=th2]").property("value")
			const model = new Canny(th1, th2)
			let y = model.predict(tx)
			pred_cb(y.flat())
		}, null, 1);
	}

	elm.append("span")
		.text(" big threshold ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "th1")
		.attr("value", 200)
		.attr("min", 0)
		.attr("max", 255)
		.on("change", fitModel)
	elm.append("span")
		.text(" small threshold ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "th2")
		.attr("value", 80)
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
	dispCanny(platform.setting.ml.configElement, platform);
}
