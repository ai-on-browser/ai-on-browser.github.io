/**
 * Budget Perceptron
 */
export default class BudgetPerceptron {
	// Online Classification on a Budget
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.9.3578&rep=rep1&type=pdf
	/**
	 * @param {number} beta Tolerance
	 * @param {number} [n] Cachs size
	 */
	constructor(beta, n) {
		this._beta = beta
		this._n = n

		this._w = null
		this._c = 0
		this._s = []
	}

	/**
	 * Fit model parameters.
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
			if (pt * y[i] <= this._beta) {
				for (let j = 0; j < x[i].length; j++) {
					this._w[j] += y[i] * x[i][j]
				}
				this._c += y[i]

				if (this._n <= 0) {
					for (let k = this._s.length - 1; k >= 0; k--) {
						const r = this._s[k]
						const pk = r.x.reduce((s, v, j) => s + v * (this._w[j] - r.y * r.x[j]), this._c - r.y)
						if (pk * r.y > this._beta) {
							continue
						}
						this._s.splice(k, 1)
					}
				} else if (this._s.length >= this._n) {
					const p = this._s.map((r, m) => [
						m,
						r.x.reduce((s, v, j) => s + v * (this._w[j] - r.y * r.x[j]), this._c - r.y) * r.y,
					])
					p.sort((a, b) => b[1] - a[1])
					this._s.splice(p[0][0], 1)
				}
				this._s.push({ x: x[i], y: y[i] })
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
