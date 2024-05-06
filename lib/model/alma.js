/**
 * Approximate Large Margin algorithm
 * @see A New Approximate Maximal Margin Classification Algorithm. (2001)
 */
export default class ALMA {
	// https://www.jmlr.org/papers/volume2/gentile01a/gentile01a.pdf
	// A New Approximate Maximal Margin Classification Algorithm. (2001)
	/**
	 * @param {number} p Power parameter for norm
	 * @param {number} alpha Degree of approximation to the optimal margin hyperplane
	 * @param {number} b Tuning parameter
	 * @param {number} c Tuning parameter
	 */
	constructor(p = 2, alpha = 1, b = 1, c = 1) {
		this._p = p
		this._alpha = alpha
		this._b = b
		this._c = c
		this._w = null
		this._w0 = 0
		this._k = 1
	}

	/**
	 * Update model parameters with one data.
	 * @param {number[]} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		const gamma = this._b * Math.sqrt((this._p - 1) / this._k)
		const m = this._w.reduce((s, v, d) => s + v * x[d], this._w0)
		if (m * y > (1 - this._alpha) * gamma) return

		const eta = this._c / Math.sqrt((this._p - 1) * this._k)
		const dw = this._w.map((v, d) => x[d] * eta * y + v)
		const dw0 = eta * y + this._w0

		const norm = dw.reduce((s, v) => s + v ** this._p, dw0 ** this._p) ** (1 / this._p)
		const d = Math.max(1, norm)
		this._w = dw.map(v => v / d)
		this._w0 = dw0 / d
		this._k++
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
			this.update(x[i], y[i])
		}
	}

	/**
	 * Returns predicted datas.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const r = data[i].reduce((s, v, d) => s + v * this._w[d], this._w0)
			p[i] = r <= 0 ? -1 : 1
		}
		return p
	}
}
