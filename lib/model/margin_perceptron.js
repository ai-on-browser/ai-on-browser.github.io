/**
 * Margin Perceptron
 */
export default class MarginPerceptron {
	// https://www.slideshare.net/sleepy_yoshi/tokyonlp5
	// https://www.info.kindai.ac.jp/~shirahama/courses/ml/2019/slides/slides_6.pdf
	// Learning algorithms with optimal stablilty in neural networks
	// https://www.marcmezard.fr/wp-content/uploads/2019/01/87_MK_JPA.pdf
	/**
	 * @param {number} rate Learning rate
	 */
	constructor(rate) {
		this._r = rate
		this._g = 1

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

		for (let i = 0; i < x.length; i++) {
			const pt = x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			if (y[i] * pt <= this._g) {
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
