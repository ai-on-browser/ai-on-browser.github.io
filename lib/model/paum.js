/**
 * Perceptron Algorithm with Uneven Margins
 */
export default class PAUM {
	// https://www.slideshare.net/sleepy_yoshi/tokyonlp5
	// The perceptron algorithm with uneven margins
	// https://herbrich.me/papers/paum.pdf
	/**
	 * @param {number} rate Learning rate
	 * @param {number} tp Margin parameter for +1
	 * @param {number} tm Margin parameter for -1
	 */
	constructor(rate, tp, tm) {
		this._r = rate
		this._tp = tp
		this._tm = tm

		this._w = null
		this._c = 0
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		if (!this._w) {
			this._w = Array(x[0].length).fill(0)
		}
		this._epoch++

		for (let i = 0; i < x.length; i++) {
			const pt = x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			if ((y[i] === -1 && y[i] * pt <= this._tm) || (y[i] === 1 && y[i] * pt <= this._tp)) {
				for (let j = 0; j < x[i].length; j++) {
					this._w[j] += this._r * y[i] * x[i][j]
				}
				this._c += this._r * y[i]
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
			const r = data[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			p.push(r <= 0 ? -1 : 1)
		}
		return p
	}
}
