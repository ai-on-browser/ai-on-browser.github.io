/**
 * Ballseptron
 */
export default class Ballseptron {
	// A New Perspective on an Old Perceptron Algorithm
	// https://www.cs.huji.ac.il/~shais/papers/ShalevSi05.pdf
	/**
	 * @param {number} r Radius
	 */
	constructor(r) {
		this._r = r
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {(1 | -1)[]} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = train_x
		this._y = train_y

		this._w = Array(this._x[0].length).fill(0)
		this._c = 0
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.length; i++) {
			const pt = this._x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			if (pt * this._y[i] <= 0) {
				for (let j = 0; j < this._x[i].length; j++) {
					this._w[j] += this._y[i] * this._x[i][j]
				}
				this._c += this._y[i]
			} else {
				const wnorm = Math.sqrt(this._w.reduce((s, v) => s + v ** 2, this._c ** 2))
				if ((pt * this._y[i]) / wnorm < this._r) {
					for (let j = 0; j < this._x[i].length; j++) {
						this._w[j] += this._y[i] * (this._x[i][j] - (this._y[i] * this._r * this._w[j]) / wnorm)
					}
					this._c += this._y[i] * (1 - (this._y[i] * this._r * this._c) / wnorm)
				}
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
