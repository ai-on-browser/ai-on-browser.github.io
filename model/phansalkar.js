import { Matrix } from '../js/math.js'

export default class PhansalkarThresholding {
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
					const t = v * (1 + this._p * Math.exp(-this._q * v) + this._k * (std.value[u] / this._r - 1))
					return x[i][j][u] < t ? 0 : 255
				})
			}
		}
		return p
	}
}
