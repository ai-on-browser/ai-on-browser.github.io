import { Matrix } from '../js/math.js'

export default class NiblackThresholding {
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
				p[i][j] = m.copySub(s).value.map((v, u) => (x[i][j][u] < v ? 0 : 255))
			}
		}
		return p
	}
}
