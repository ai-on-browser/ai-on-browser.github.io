import Matrix from '../util/matrix.js'

/**
 * Bayesian linear regression
 */
export default class BayesianLinearRegression {
	// https://qiita.com/tshimizu8/items/e5f2320ce02973a19563
	// https://leck-tech.com/machine-learning/bayesian-regression
	/**
	 * @param {number} [lambda=0.1]
	 * @param {number} [sigma=0.2]
	 */
	constructor(lambda = 0.1, sigma = 0.2) {
		this._w = null
		this._lambda = lambda
		this._sigma = sigma
		this._m = null
		this._s = null
		this._beta = 1 / sigma ** 2
		this._alpha = lambda * this._beta
	}

	_init(x, y) {
		this._m = Matrix.zeros(x.cols + 1, y.cols)
		this._s = Matrix.eye(x.cols + 1, x.cols + 1, 1 / this._alpha)
	}

	/**
	 * Fit model once.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		if (!this._m) {
			this._init(x, y)
		}
		const xh = Matrix.resize(x, x.rows, x.cols + 1, 1)
		for (let i = 0; i < x.rows; i++) {
			const xi = xh.row(i)
			const sinv = this._s.inv()
			const pp = xi.tDot(xi)
			pp.mult(this._beta)
			pp.add(sinv)
			this._s = pp.inv()

			const mm = xi.tDot(y.row(i))
			mm.mult(this._beta)
			mm.add(sinv.dot(this._m))
			this._m = this._s.dot(mm)
		}
		this._w = this._m
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const xh = Matrix.resize(x, x.rows, x.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
