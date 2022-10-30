/**
 * Margin Infused Relaxed Algorithm
 */
export default class MIRA {
	// Ultraconservative Online Algorithms for Multiclass Problems
	// https://www.jmlr.org/papers/volume3/crammer03a/crammer03a.pdf
	// https://en.wikipedia.org/wiki/Margin-infused_relaxed_algorithm
	// Online (and Offline) on an Even Tighter Budget
	// http://proceedings.mlr.press/r5/weston05a/weston05a.pdf
	constructor() {
		this._w = null
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

		this._w = Array(this._x[0].length).fill(1)
		this._b = 0
	}

	/**
	 * Update model parameters with one data.
	 *
	 * @param {number[]} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		const m = x.reduce((s, v, j) => s + v * this._w[j], this._b)
		const v = (-y * m) / x.reduce((s, v) => s + v ** 2, 0)
		const tau = Math.max(0, Math.min(1, v))
		if (tau > 0) {
			for (let i = 0; i < this._w.length; i++) {
				this._w[i] += tau * y * x[i]
				this._b += tau * y
			}
		}
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.length; i++) {
			this.update(this._x[i], this._y[i])
		}
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const m = data[i].reduce((s, v, j) => s + v * this._w[j], 0)
			p.push(m + this._b <= 0 ? -1 : 1)
		}
		return p
	}
}
