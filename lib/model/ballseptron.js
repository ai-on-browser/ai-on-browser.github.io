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
		this._w = null
		this._c = 0
	}

	/**
	 * Fit model parameters.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {(1 | -1)[]} y Target values
	 */
	fit(x, y) {
		if (!this._w) {
			this._w = Array(x[0].length).fill(0)
		}
		for (let i = 0; i < x.length; i++) {
			const pt = x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			if (pt * y[i] <= 0) {
				for (let j = 0; j < x[i].length; j++) {
					this._w[j] += y[i] * x[i][j]
				}
				this._c += y[i]
			} else {
				const wnorm = Math.sqrt(this._w.reduce((s, v) => s + v ** 2, this._c ** 2))
				if ((pt * y[i]) / wnorm < this._r) {
					for (let j = 0; j < x[i].length; j++) {
						this._w[j] += y[i] * (x[i][j] - (y[i] * this._r * this._w[j]) / wnorm)
					}
					this._c += y[i] * (1 - (y[i] * this._r * this._c) / wnorm)
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
