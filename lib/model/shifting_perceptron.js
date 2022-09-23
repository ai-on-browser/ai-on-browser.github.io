/**
 * Shifting Perceptron Algorithm
 */
export default class ShiftingPerceptron {
	// Tracking the Best Hyperplane with a Simple Budget Perceptron
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.107.6201&rep=rep1&type=pdf
	/**
	 * @param {number} lambda Rate of weight decay
	 */
	constructor(lambda) {
		this._lambda = lambda
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = train_x
		this._y = train_y
		this._k = 0
		this._l = 1

		this._w = Array(this._x[0].length).fill(0)
		this._c = 0
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.length; i++) {
			const pt = this._x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			const yh = pt <= 0 ? -1 : 1
			if (this._y[i] !== yh) {
				for (let j = 0; j < this._x[i].length; j++) {
					this._w[j] = (1 - this._l) * this._w[j] + this._y[i] * this._x[i][j]
				}
				this._c = (1 - this._l) * this._c + this._y[i]
				this._k += 1
				this._l = this._lambda / (this._lambda + this._k)
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const m = data[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			p.push(m <= 0 ? -1 : 1)
		}
		return p
	}
}
