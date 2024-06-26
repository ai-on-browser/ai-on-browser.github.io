import Matrix from '../util/matrix.js'

/**
 * Relevance vector machine
 */
export default class RVM {
	// https://qiita.com/ctgk/items/ee512530618a5eeccd1a
	// https://en.wikipedia.org/wiki/Relevance_vector_machine
	constructor() {
		this._alpha = 1.0
		this._beta = 1.0
	}

	_kernel(x, y) {
		const k = Matrix.sub(x, y)
		return Math.exp(-10 * k.norm() ** 2)
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		this._x = x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const n = x.rows

		const p = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				const k = this._kernel(x.row(i), x.row(j))
				p.set(i, j, k)
				p.set(j, i, k)
			}
		}
		const a = Array(n).fill(this._alpha)

		let maxCount = 1
		while (maxCount-- > 0) {
			const prec = p.tDot(p)
			prec.mult(this._beta)
			prec.add(Matrix.diag(a))
			this._cov = prec.inv()

			this._mean = this._cov.dot(p.tDot(y))
			this._mean.mult(this._beta)

			const g = []
			for (let i = 0; i < n; i++) {
				g.push(1 - a[i] * this._cov.at(i, i))
				a[i] = g[i] / Math.sqrt(this._mean.at(i, 0))
			}
			const tmp = Matrix.sub(y, p.dot(this._mean))
			tmp.map(v => v ** 2)

			this._beta = (n - g.reduce((s, v) => s + v, 0)) / tmp.sum()
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		const n = this._x.rows
		x = Matrix.fromArray(x)
		const m = x.rows
		const k = new Matrix(m, n)
		for (let i = 0; i < m; i++) {
			for (let j = 0; j < n; j++) {
				const v = this._kernel(x.row(i), this._x.row(j))
				k.set(i, j, v)
			}
		}

		const mean = k.dot(this._mean)
		return mean.value
	}
}
