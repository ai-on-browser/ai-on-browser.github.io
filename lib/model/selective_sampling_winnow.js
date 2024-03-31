/**
 * Selective sampling Winnow
 */
export default class SelectiveSamplingWinnow {
	// Worst-case analysis of selective sampling for linear classification.
	// https://www.jmlr.org/papers/volume7/cesa-bianchi06b/cesa-bianchi06b.pdf
	/**
	 * @param {number} b Smooth parameter
	 * @param {boolean} [alpha] Learning rate
	 */
	constructor(b, alpha = 2) {
		this._b = b
		this._alpha = alpha
		this._w = null
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<1 | -1>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		if (!this._w) {
			this._w = Array(x[0].length).fill(1 / x[0].length)
		}

		for (let i = 0; i < x.length; i++) {
			const pt = x[i].reduce((s, v, d) => s + v * this._w[d], 0)
			const yh = pt <= 0 ? -1 : 1
			const z = Math.random() < this._b / (this._b + Math.abs(pt))
			if (z && y[i] !== yh) {
				let ws = 0
				for (let d = 0; d < this._w.length; d++) {
					this._w[d] *= Math.exp(x[i][d] * y[i] * this._alpha)
					ws += this._w[d]
				}
				for (let d = 0; d < this._w.length; d++) {
					this._w[d] /= ws
				}
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<1 | -1>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const pt = data[i].reduce((s, v, d) => s + v * this._w[d], 0)
			p[i] = pt <= 0 ? -1 : 1
		}
		return p
	}
}
