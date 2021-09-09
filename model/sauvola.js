import { Matrix } from '../js/math.js'

export default class SauvolaThresholding {
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
				p[i][j] = m.copyMult(s).value.map((v, u) => (x[i][j][u] < v ? 0 : 255))
			}
		}
		return p
	}
}
