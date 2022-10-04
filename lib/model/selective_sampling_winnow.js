import Matrix from '../util/matrix.js'

/**
 * Selective sampling Winnow
 */
export default class SelectiveSamplingWinnow {
	// Worst-case analysis of selective sampling for linear classification.
	// https://www.jmlr.org/papers/volume7/cesa-bianchi06b/cesa-bianchi06b.pdf
	/**
	 * @param {number} b Smooth parameter
	 * @param {boolean} [alpha=2] Learning rate
	 */
	constructor(b, alpha = 2) {
		this._b = b
		this._alpha = alpha
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<1 | -1>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._y = train_y
		this._epoch = 0

		this._w = Matrix.ones(this._x.cols, 1)
		this._w.div(this._x.cols)
	}

	/**
	 * Fit model.
	 */
	fit() {
		const o = this._x.dot(this._w)
		o.map(v => (v <= 0 ? -1 : 1))
		this._epoch++

		for (let i = 0; i < this._x.rows; i++) {
			const pt = o.at(i, 0)
			const yh = pt <= 0 ? -1 : 1
			const z = Math.random() < this._b / (this._b + Math.abs(pt))
			if (z && this._y[i] !== yh) {
				this._w.mult(Matrix.map(this._x.row(i).t, v => Math.exp(v * this._y[i] * this._alpha)))
				this._w.div(this._w.sum())
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<0 | 1>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		return x.dot(this._w).value.map(v => (v <= 0 ? -1 : 1))
	}
}
