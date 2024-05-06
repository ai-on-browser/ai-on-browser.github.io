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
		this._k = 0
		this._l = 1

		this._w = null
		this._c = 0
	}

	/**
	 * Fit model parameters.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		if (!this._w) {
			this._w = Array(x[0].length).fill(0)
		}
		for (let i = 0; i < x.length; i++) {
			const pt = x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			const yh = pt <= 0 ? -1 : 1
			if (y[i] !== yh) {
				for (let j = 0; j < x[i].length; j++) {
					this._w[j] = (1 - this._l) * this._w[j] + y[i] * x[i][j]
				}
				this._c = (1 - this._l) * this._c + y[i]
				this._k += 1
				this._l = this._lambda / (this._lambda + this._k)
			}
		}
	}

	/**
	 * Returns predicted values.
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
