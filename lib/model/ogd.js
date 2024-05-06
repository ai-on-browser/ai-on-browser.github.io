/**
 * Online gradient descent
 */
export default class OnlineGradientDescent {
	// https://olpy.readthedocs.io/en/latest/modules/olpy.classifiers.OGD.html#olpy.classifiers.OGD
	/**
	 * @param {number} [c] Tuning parameter
	 * @param {'zero_one'} [loss] Loss type name
	 */
	constructor(c = 1, loss = 'zero_one') {
		this._c = c
		this._w = null
		this._w0 = 0
		this._t = 1

		if (loss === 'zero_one') {
			this._loss = (t, y) => {
				return t === y ? 0 : 1
			}
		}
	}

	/**
	 * Update model parameters with one data.
	 * @param {number[]} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		const m = Math.sign(this._w.reduce((s, v, d) => s + v * x[d], this._w0))
		const loss = this._loss(y, m)
		if (loss === 0) return
		const c = this._c / Math.sqrt(this._t)

		for (let i = 0; i < this._w.length; i++) {
			this._w[i] += c * y * x[i]
		}
		this._w0 += c * y
		this._t++
	}

	/**
	 * Fit model parameters.
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
