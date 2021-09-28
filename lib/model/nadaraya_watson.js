import { Matrix } from '../util/math.js'

/**
 * Nadaraya–Watson kernel regression
 */
export default class NadarayaWatson {
	// https://www.slideshare.net/yukaraikemiya/6-15415589
	/**
	 * @param {?number} s
	 */
	constructor(s) {
		this._s = s
		this._p = x => {
			const de = Math.sqrt(2 * Math.PI * this._s) ** x.cols
			const v = x.copyMult(x)
			const s = v.sum(1)
			s.map(v => Math.exp(-v / this._s) / de)
			return s
		}
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		this._y = y

		if (!this._s) {
			// Silverman's method
			const n = x.length
			const k = x.map(d => Math.sqrt(d.reduce((s, v) => s + v ** 2, 0)))
			const mean = k.reduce((s, v) => s + v, 0) / n
			const std = Math.sqrt(k.reduce((s, v) => s + (v - mean) ** 2, 0) / n)
			k.sort((a, b) => a - b)
			const q = p => {
				const np = n * p
				const np_l = Math.floor(np)
				const np_h = Math.ceil(np)
				return k[np_l] + (np_h - np_l) * (k[np_h] - k[np_l])
			}
			const sgm = Math.min(std, (q(0.75) - q(0.25)) / 1.34)

			const h = (1.06 * sgm) / Math.pow(n, 0.2)
			this._s = h ** 2
		}
		this._x = Matrix.fromArray(x)
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x
	 * @returns {number[]}
	 */
	predict(x) {
		const n = this._x.rows
		return x.map(v => {
			const d = this._x.copySub(new Matrix(1, v.length, v))
			const p = this._p(d)

			let s = 0
			for (let i = 0; i < n; i++) {
				s += this._y[i][0] * p.value[i]
			}
			return s / p.sum()
		})
	}
}
