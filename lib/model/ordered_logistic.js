import Matrix from '../util/matrix.js'

/**
 * Ordered logistic regression
 */
export default class OrderedLogisticRegression {
	// https://en.wikipedia.org/wiki/Ordered_logit
	// https://en.wikipedia.org/wiki/Ordinal_regression
	/**
	 * @param {number} [rate] Learning rate
	 */
	constructor(rate = 0.1) {
		this._w = null
		this._a = rate
	}

	_s(x) {
		return 1 / (1 + Math.exp(-x))
	}

	/**
	 * Fit model.
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
			const pk0 = this._s(this._t[k] - pstar[i])
			const pk1 = this._s(this._t[k + 1] - pstar[i])
			if (pk0 === pk1) {
				continue
			}

			dt[k] += (pk0 * (1 - pk0)) / (pk0 - pk1)
			dt[k + 1] -= (pk1 * (1 - pk1)) / (pk0 - pk1)

			const dwi = x.row(i).t
			dwi.mult(pk0 + pk1 - 1)
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
