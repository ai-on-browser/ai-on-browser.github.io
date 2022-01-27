import Matrix from '../util/matrix.js'

/**
 * Method of Optimal Direction
 */
export default class MOD {
	// https://www.ieice.org/ess/sita/forum/article/2015/201512081915.pdf
	// https://en.wikipedia.org/wiki/Sparse_dictionary_learning
	/**
	 * @param {Array<Array<number>>} x
	 * @param {number} k
	 */
	constructor(x, k) {
		this._x = Matrix.fromArray(x)
		this._k = k
		this._d = Matrix.randn(this._x.cols, k)
		this._d.div(
			this._d
				.copyMap(v => v ** 2)
				.mean(0)
				.copyMap(Math.sqrt)
		)
	}

	/**
	 * Fit model and returns reduced values.
	 *
	 * @returns {Array<Array<number>>}
	 */
	fit() {
		const x = new Matrix(this._x.rows, this._k)
		for (let i = 0; i < this._x.rows; i++) {
			const xi = this._omp(this._x.row(i).t)
			x.set(i, 0, xi.t)
		}
		this._d = this._x.tDot(x.dot(x.tDot(x).inv()))
		this._r = x
		return this._r.toArray()
	}

	_omp(y) {
		let x = Matrix.zeros(this._k, 1)
		let r = y
		const s = []

		for (let i = 0; i < this._k; i++) {
			let min_e = Infinity
			let min_i = -1
			for (let k = 0; k < this._k; k++) {
				if (s.indexOf(k) >= 0) {
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
			x = as.tDot(as).solve(as.tDot(y))
			r = y.copySub(as.dot(x))

			if (r.norm() < 1.0e-8) {
				break
			}
		}
		return x
	}

	/**
	 * Returns reduced values.
	 *
	 * @returns {Array<Array<number>>}
	 */
	predict() {
		return this._r.toArray()
	}
}
