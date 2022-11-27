/**
 * Selective sampling Perceptron
 */
export class SelectiveSamplingPerceptron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Worst-case analysis of selective sampling for linear classification.
	// https://www.jmlr.org/papers/volume7/cesa-bianchi06b/cesa-bianchi06b.pdf
	/**
	 * @param {number} b Smooth parameter
	 * @param {number} rate Learning rate
	 */
	constructor(b, rate) {
		this._b = b
		this._r = rate

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
			const yh = pt <= 0 ? -1 : 1
			const z = Math.random() < this._b / (this._b + Math.abs(pt))
			if (z && y[i] !== yh) {
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

/**
 * Selective sampling Perceptron with adaptive parameter
 */
export class SelectiveSamplingAdaptivePerceptron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Worst-case analysis of selective sampling for linear classification.
	// https://www.jmlr.org/papers/volume7/cesa-bianchi06b/cesa-bianchi06b.pdf
	/**
	 * @param {number} beta Smooth parameter
	 * @param {number} rate Learning rate
	 */
	constructor(beta, rate) {
		this._beta = beta
		this._r = rate

		this._w = null
		this._c = 0
		this._k = 0
		this._X = 0
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
			const yh = pt <= 0 ? -1 : 1
			const xd = Math.max(this._X, Math.sqrt(x[i].reduce((s, v) => s + v ** 2, 0)))
			const b = this._beta * xd ** 2 * Math.sqrt(1 + this._k)
			const z = Math.random() < b / (b + Math.abs(pt))
			if (z && y[i] !== yh) {
				for (let j = 0; j < x[i].length; j++) {
					this._w[j] += this._r * y[i] * x[i][j]
				}
				this._c += this._r * y[i]
				this._k += 1
				this._X = xd
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
