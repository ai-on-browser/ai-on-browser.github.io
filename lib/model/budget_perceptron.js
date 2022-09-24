/**
 * Budget Perceptron
 */
export default class BudgetPerceptron {
	// Online Classification on a Budget
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.9.3578&rep=rep1&type=pdf
	/**
	 * @param {number} beta Tolerance
	 * @param {number} [n=0] Cachs size
	 */
	constructor(beta, n) {
		this._beta = beta
		this._n = n
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

		this._w = Array(this._x[0].length).fill(0)
		this._c = 0
		this._s = []
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.length; i++) {
			const pt = this._x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			if (pt * this._y[i] <= this._beta) {
				for (let j = 0; j < this._x[i].length; j++) {
					this._w[j] += this._y[i] * this._x[i][j]
				}
				this._c += this._y[i]

				if (this._n <= 0) {
					for (let k = this._s.length - 1; k >= 0; k--) {
						const r = this._s[k]
						const pk = this._x[r].reduce(
							(s, v, j) => s + v * (this._w[j] - this._y[j] * this._x[r][j]),
							this._c - this._y[r]
						)
						if (pk * this._y[r] > this._beta) {
							continue
						}
						this._s.splice(k, 1)
					}
				} else if (this._s.length >= this._n) {
					const p = this._s.map((r, m) => [
						m,
						this._x[r].reduce(
							(s, v, j) => s + v * (this._w[j] - this._y[j] * this._x[r][j]),
							this._c - this._y[r]
						) * this._y[r],
					])
					p.sort((a, b) => b[1] - a[1])
					this._s.splice(p[0][0], 1)
				}
				this._s.push(i)
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
