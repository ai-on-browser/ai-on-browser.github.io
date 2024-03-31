/**
 * Passive Aggressive
 */
export default class PA {
	// https://www.slideshare.net/hirsoshnakagawa3/ss-32274089
	/**
	 * @param {0 | 1 | 2} [v] Version number
	 */
	constructor(v = 0) {
		this._c = 0.1
		this._v = v
		this._w = null
		this._w0 = 0
	}

	/**
	 * Update model parameters with one data.
	 *
	 * @param {number[]} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		const m = this._w.reduce((s, v, d) => s + v * x[d], this._w0)
		if (y * m >= 1) return
		const l = Math.max(0, 1 - y * m)
		const n = x.reduce((s, v) => s + v ** 2, 1)
		let t = 0
		if (this._v === 0) {
			t = l / n
		} else if (this._v === 1) {
			t = Math.min(this._c, l / n)
		} else if (this._v === 2) {
			t = l / (n + 1 / (2 * this._c))
		}
		for (let d = 0; d < this._w.length; d++) {
			this._w[d] += t * y * x[d]
		}
		this._w0 += t * y
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
			this._w0 = 0
		}
		for (let i = 0; i < x.length; i++) {
			this.update(x[i], y[i])
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
			const r = data[i].reduce((s, v, d) => s + v * this._w[d], this._w0)
			p[i] = r <= 0 ? -1 : 1
		}
		return p
	}
}
