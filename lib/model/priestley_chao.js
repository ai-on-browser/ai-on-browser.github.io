import Matrix from '../util/matrix.js'

/**
 * Priestley–Chao kernel estimator
 */
export default class PriestleyChao {
	// https://en.wikipedia.org/wiki/Kernel_regression
	// http://www.ma.man.ac.uk/~peterf/MATH38011/NPR%20P-C%20Estimator.pdf
	/**
	 * @param {number} h
	 */
	constructor(h) {
		this._h = h
		this._p = x => {
			const de = Math.sqrt(2 * Math.PI) ** x.cols
			const v = Matrix.mult(x, x)
			const s = v.sum(1)
			s.map(v => Math.exp(-v / 2) / de)
			return s
		}
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		if (!this._h) {
			// Silverman's method
			const n = x.length
			const k = x.map(d => Math.sqrt(d.reduce((s, v) => s + v ** 2, 0)))
			const mean = k.reduce((s, v) => s + v, 0) / n
			const std = Math.sqrt(k.reduce((s, v) => s + (v - mean) ** 2, 0) / n)
			k.sort((a, b) => a - b)
			const q = p => {
				const np = (n - 1) * p
				const np_l = Math.floor(np)
				const np_h = Math.ceil(np)
				return k[np_l] + (np - np_l) * (k[np_h] - k[np_l])
			}
			const sgm = Math.min(std, (q(0.75) - q(0.25)) / 1.34)

			this._h = (1.06 * sgm) / Math.pow(n, 0.2)
		}
		const d = x.map((v, i) => [v[0], y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = Matrix.fromArray(d.map(v => v[0]))
		this._x2 = this._x.slice(1)
		this._xd = Matrix.sub(this._x2, this._x.slice(0, x.length - 1))
		this._y = d.map(v => v[1])
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {number[]}
	 */
	predict(x) {
		const n = this._x2.rows
		return x.map(v => {
			const d = Matrix.sub(this._x2, new Matrix(1, 1, v[0]))
			d.div(this._h)
			const p = this._p(d)
			p.mult(this._xd)

			let s = 0
			for (let i = 0; i < n; i++) {
				s += this._y[i][0] * p.value[i]
			}
			return s / this._h
		})
	}
}
