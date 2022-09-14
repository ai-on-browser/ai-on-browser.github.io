/**
 * Voted-perceptron
 */
export default class VotedPerceptron {
	// Large Margin Classification Using the Perceptron Algorithm
	// https://cseweb.ucsd.edu/~yfreund/papers/LargeMarginsUsingPerceptron.pdf
	// https://www.slideshare.net/sleepy_yoshi/tokyonlp5
	constructor() {}

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

		this._v = []
		this._b = []
		this._c = []
	}

	/**
	 * Fit model.
	 */
	fit() {
		for (let i = 0; i < this._x.length; i++) {
			if (this._v.length === 0) {
				this._v.push(this._x[i].map(v => this._y[i] * v))
				this._b.push(this._y[i])
				this._c.push(1)
				continue
			}
			const vk = this._v[this._v.length - 1]
			const yh = this._x[i].reduce((s, v, j) => s + v * vk[j], 0) + this._b[this._b.length - 1] < 0 ? -1 : 1
			if (yh === this._y[i]) {
				this._c[this._c.length - 1]++
			} else {
				this._v.push(this._x[i].map((v, j) => vk[j] + this._y[i] * v))
				this._b.push(this._b[this._b.length - 1] + this._y[i])
				this._c.push(1)
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
		const pred = []
		for (let i = 0; i < data.length; i++) {
			let s = 0
			for (let k = 0; k < this._v.length; k++) {
				s += this._c[k] * (data[i].reduce((s, v, j) => s + v * this._v[k][j], 0) + this._b[k] < 0 ? -1 : 1)
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}
