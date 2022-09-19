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
			const yh = pt <= 0 ? -1 : 1
			const z = Math.random() < this._b / (this._b + Math.abs(pt))
			if (z && this._y[i] !== yh) {
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
		this._k = 0
		this._X = 0
	}

	/**
	 * Fit model.
	 */
	fit() {
		this._epoch++

		for (let i = 0; i < this._x.length; i++) {
			const pt = this._x[i].reduce((s, v, j) => s + v * this._w[j], this._c)
			const yh = pt <= 0 ? -1 : 1
			const xd = Math.max(this._X, Math.sqrt(this._x[i].reduce((s, v) => s + v ** 2, 0)))
			const b = this._beta * xd ** 2 * Math.sqrt(1 + this._k)
			const z = Math.random() < b / (b + Math.abs(pt))
			if (z && this._y[i] !== yh) {
				for (let j = 0; j < this._x[i].length; j++) {
					this._w[j] += this._r * this._y[i] * this._x[i][j]
				}
				this._c += this._r * this._y[i]
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
