import Matrix from '../util/matrix.js'

/**
 * Quantile regression
 */
export default class QuantileRegression {
	// https://salad-bowl-of-knowledge.github.io/hp/statistics/2020/01/21/quantile_regression.html
	// https://en.wikipedia.org/wiki/Quantile_regression
	/**
	 * @param {number} [tau=0.5] Quantile value
	 * @param {number} [learningRate=0.1] Learning rate
	 */
	constructor(tau = 0.5, learningRate = 0.1) {
		this._tau = tau
		this._lr = learningRate
		this._w = null
	}

	/**
	 * Learning rage
	 *
	 * @param {number} value New learning rate
	 */
	set lr(value) {
		this._lr = value
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const n = x.rows
		const xh = Matrix.resize(x, n, x.cols + 1, 1)

		if (this._w === null) {
			this._w = Matrix.randn(xh.cols, y.cols)
		}

		const p = xh.dot(this._w)
		const d = Matrix.sub(y, p)
		const indicator = Matrix.map(d, v => (v <= 0 ? 1 : 0))
		const g = Matrix.sub(indicator, this._tau)
		g.map(v => Math.abs(v))
		g.mult(Matrix.map(d, v => Math.sign(v)))
		const dw = xh.tDot(g)
		dw.mult(this._lr)

		this._w.add(dw)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const xh = Matrix.resize(x, x.rows, x.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
