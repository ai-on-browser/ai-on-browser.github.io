/**
 * Voted-perceptron
 */
export default class VotedPerceptron {
	// Large Margin Classification Using the Perceptron Algorithm
	// https://cseweb.ucsd.edu/~yfreund/papers/LargeMarginsUsingPerceptron.pdf
	// https://www.slideshare.net/sleepy_yoshi/tokyonlp5
	/**
	 * @param {number} [rate] Learning rate
	 */
	constructor(rate = 1) {
		this._r = rate

		this._v = []
		this._b = []
		this._c = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		for (let i = 0; i < x.length; i++) {
			if (this._v.length === 0) {
				this._v.push(x[i].map(v => this._r * y[i] * v))
				this._b.push(this._r * y[i])
				this._c.push(1)
				continue
			}
			const vk = this._v[this._v.length - 1]
			const yh = x[i].reduce((s, v, j) => s + v * vk[j], 0) + this._b[this._b.length - 1] < 0 ? -1 : 1
			if (yh === y[i]) {
				this._c[this._c.length - 1]++
			} else {
				this._v.push(x[i].map((v, j) => vk[j] + this._r * y[i] * v))
				this._b.push(this._b[this._b.length - 1] + this._r * y[i])
				this._c.push(1)
			}
		}
	}

	/**
	 * Returns predicted values.
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
