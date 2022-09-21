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
		this._epoch = 0

		this._w = Array(this._x[0].length).fill(0)
		this._c = 0
	}

	/**
	 * Fit model.
	 */
	fit() {
		this._epoch++

		for (let i = 0; i < this._x.length; i++) {
			const pt = this._x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			if (
				(this._y[i] === -1 && this._y[i] * pt <= this._tm) ||
				(this._y[i] === 1 && this._y[i] * pt <= this._tp)
			) {
				for (let j = 0; j < this._x[i].length; j++) {
					this._w[j] += this._r * this._y[i] * this._x[i][j]
				}
				this._c += this._r * this._y[i]
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
