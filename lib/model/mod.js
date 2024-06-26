import Matrix from '../util/matrix.js'

/**
 * Method of Optimal Direction
 */
export default class MOD {
	// https://www.ieice.org/ess/sita/forum/article/2015/201512081915.pdf
	// https://en.wikipedia.org/wiki/Sparse_dictionary_learning
	/**
	 * @param {Array<Array<number>>} x Training data
	 * @param {number} m Reduced dimension
	 * @param {number} [k] Sparsity parameter
	 */
	constructor(x, m, k = m) {
		this._x = Matrix.fromArray(x)
		this._m = m
		this._k = k
		this._d = Matrix.randn(this._x.cols, m)
		this._d.div(Matrix.map(Matrix.map(this._d, v => v ** 2).mean(0), Math.sqrt))
	}

	/**
	 * Fit model and returns reduced values.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	fit() {
		const x = new Matrix(this._x.rows, this._m)
		for (let i = 0; i < this._x.rows; i++) {
			const xi = this._omp(this._x.row(i).t)
			x.set(i, 0, xi.t)
		}
		this._d = this._x.tDot(x.dot(x.tDot(x).inv()))
		this._r = x
		return this._r.toArray()
	}

	_omp(y) {
		let x = Matrix.zeros(this._m, 1)
		let r = y
		const s = []

		for (let i = 0; i < this._k; i++) {
			let min_e = Infinity
			let min_i = -1
			for (let k = 0; k < this._m; k++) {
				if (s.includes(k)) {
					continue
				}
				const a = this._d.col(k)
				const e = r.norm() ** 2 - a.tDot(r).toScaler() ** 2 / (a.norm() ** 2 + 1.0e-12)
				if (e < min_e) {
					min_e = e
					min_i = k
				}
			}
			s.push(min_i)

			const as = this._d.col(s)
			const xs = as.tDot(as).solve(as.tDot(y))
			for (let i = 0; i < s.length; i++) {
				x.set(s[i], 0, xs.row(i))
			}
			r = Matrix.sub(y, as.dot(xs))

			if (r.norm() < 1.0e-8) {
				break
			}
		}
		return x
	}

	/**
	 * Returns reduced values.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict() {
		return this._r.toArray()
	}
}
