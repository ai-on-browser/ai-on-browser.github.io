import { Matrix } from '../util/math.js'

/**
 * Quadratic discriminant analysis
 */
export default class QuadraticDiscriminant {
	// https://arxiv.org/abs/1906.02590
	// https://online.stat.psu.edu/stat508/book/export/html/696
	constructor() {
		this._m = []
		this._s = []
		this._sinv = []
		this._c = []
		this._categories = []
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {*[]} y
	 */
	fit(x, y) {
		this._m = []
		this._s = []
		this._sinv = []
		this._c = []
		this._categories = []

		const n = x.length
		const c = new Set(y)
		for (const k of c) {
			const xk = []
			for (let i = 0; i < y.length; i++) {
				if (y[i] === k) xk.push(x[i])
			}
			if (xk.length === 0) break

			const mat = Matrix.fromArray(xk)
			this._m.push(mat.mean(0))
			const s = mat.cov()
			this._s.push(s)
			this._sinv.push(s.inv())
			this._c.push(Math.log(mat.rows / n) - Math.log(s.det()) / 2)
			this._categories.push(k)
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} data
	 * @returns {*[]}
	 */
	predict(data) {
		return data.map(d => {
			const k = this._m.length
			const m = new Matrix(1, d.length, d)
			let max_i = -1
			let max_p = -Infinity
			for (let i = 0; i < k; i++) {
				const mi = m.copySub(this._m[i])
				const v = this._c[i] - mi.dot(this._sinv[i]).dot(mi.t).toScaler() / 2
				if (max_p < v) {
					max_p = v
					max_i = i
				}
			}
			return this._categories[max_i]
		})
	}
}
