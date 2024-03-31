import Matrix from '../util/matrix.js'

/**
 * Ordered probit regression
 */
export default class OrderedProbitRegression {
	// https://en.wikipedia.org/wiki/Ordinal_regression
	/**
	 * @param {number} [rate] Learning rate
	 */
	constructor(rate = 0.001) {
		this._w = null
		this._s = 1
		this._a = rate
	}

	_gaussian(x) {
		if (x === Infinity || x === -Infinity) {
			return 0
		}
		return Math.exp(-(x ** 2) / (2 * this._s ** 2)) / Math.sqrt(2 * Math.PI * this._s ** 2)
	}

	_cdf(z) {
		if (z === Infinity) {
			return 1
		} else if (z === -Infinity) {
			return 0
		}
		const p = 0.3275911
		const a1 = 0.254829592
		const a2 = -0.284496736
		const a3 = 1.421413741
		const a4 = -1.453152027
		const a5 = 1.061405429

		const sign = z < 0 ? -1 : 1
		const x = Math.abs(z) / Math.sqrt(2 * this._s ** 2)
		const t = 1 / (1 + p * x)
		const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
		return 0.5 * (1 + sign * erf)
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<number>} y Target values
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		if (!this._response) {
			this._response = [...new Set(y)]
			this._response.sort((a, b) => a - b)
			this._t = Array.from(this._response, (_, i) => i - 1)
			this._t[0] = -Infinity
			this._t.push(Infinity)
			this._w = Matrix.randn(x.cols, 1, 0, 0.1)
		}

		const pstar = x.dot(this._w).value
		const dt = Array(this._t.length).fill(0)
		const dw = Matrix.zeros(this._w.rows, this._w.cols)
		for (let i = 0; i < y.length; i++) {
			const k = this._response.indexOf(y[i])
			const pk0 = this._cdf(this._t[k] - pstar[i])
			const pk1 = this._cdf(this._t[k + 1] - pstar[i])
			if (pk0 === pk1) {
				continue
			}

			dt[k] += this._gaussian(this._t[k] - pstar[i]) / (pk0 - pk1)
			dt[k + 1] -= this._gaussian(this._t[k + 1] - pstar[i]) / (pk0 - pk1)

			const dwi = x.row(i).t
			dwi.mult((this._gaussian(this._t[k + 1] - pstar[i]) - this._gaussian(this._t[k] - pstar[i])) / (pk0 - pk1))
			dw.add(dwi)
		}
		dw.mult(this._a / y.length)

		this._w.add(dw)
		for (let i = 1; i < this._t.length - 1; i++) {
			this._t[i] += (this._a / y.length) * dt[i]
		}
		this._t.sort((a, b) => a - b)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<number>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const pstar = x.dot(this._w).value
		const p = []
		for (let i = 0; i < pstar.length; i++) {
			p[i] = null
			for (let k = 0; k < this._response.length; k++) {
				if (this._t[k] < pstar[i] && pstar[i] <= this._t[k + 1]) {
					p[i] = this._response[k]
					break
				}
			}
		}
		return p
	}
}
