import Matrix from '../util/matrix.js'

/**
 * Winnow
 */
export default class Winnow {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Learning Quickly When Irrelevant Attributes Abound: A New Linear-threshold Algorithm
	// http://www.cs.utsa.edu/~bylander/cs6243/littlestone1988.pdf
	/**
	 * @param {boolean} [alpha=2] Learning rate
	 * @param {number} [threshold] Threshold
	 * @param {1 | 2} [version=1] Version of model
	 */
	constructor(alpha = 2, threshold = null, version = 1) {
		this._alpha = alpha
		this._th = this._th_org = threshold
		this._v = version
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<0 | 1>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._y = train_y
		this._epoch = 0
		if (this._th_org == null) {
			this._th = this._x.rows / 2
		}

		this._w = Matrix.ones(this._x.cols, 1)
	}

	/**
	 * Fit model.
	 */
	fit() {
		const o = this._x.dot(this._w)
		o.map(v => (v <= this._th ? -1 : 1))
		this._epoch++

		for (let i = 0; i < this._x.rows; i++) {
			if (o.at(i, 0) === 1 && this._y[i] === -1) {
				for (let j = 0; j < this._x.cols; j++) {
					if (this._x.at(i, j) === 1) {
						if (this._v === 1) {
							this._w.set(j, 0, 0)
						} else {
							this._w.divAt(j, 0, this._alpha)
						}
					}
				}
			} else if (o.at(i, 0) === -1 && this._y[i] === 1) {
				for (let j = 0; j < this._x.cols; j++) {
					if (this._x.at(i, j) === 1) {
						this._w.multAt(j, 0, this._alpha)
					}
				}
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
		return x.dot(this._w).value.map(v => (v <= this._th ? -1 : 1))
	}
}
