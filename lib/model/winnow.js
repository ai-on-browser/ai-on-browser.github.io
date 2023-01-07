/**
 * Winnow
 */
export default class Winnow {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Learning Quickly When Irrelevant Attributes Abound: A New Linear-threshold Algorithm
	// http://www.cs.utsa.edu/~bylander/cs6243/littlestone1988.pdf
	/**
	 * @param {boolean} [alpha=2] Learning rate
	 * @param {number} [threshold] Threshold
	 * @param {1 | 2} [version=1] Version of model
	 */
	constructor(alpha = 2, threshold = null, version = 1) {
		this._alpha = alpha
		this._th = this._th_org = threshold
		this._v = version
		this._w = null
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<0 | 1>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		if (!this._w) {
			this._w = Array(x[0].length).fill(1)
			this._th = x[0].length / 2
		}

		for (let i = 0; i < x.length; i++) {
			const r = x[i].reduce((s, v, d) => s + v * this._w[d], 0)
			const o = r <= this._th ? -1 : 1
			if (o === 1 && y[i] === -1) {
				for (let j = 0; j < x[i].length; j++) {
					if (x[i][j] === 1) {
						if (this._v === 1) {
							this._w[j] = 0
						} else {
							this._w[j] /= this._alpha
						}
					}
				}
			} else if (o === -1 && y[i] === 1) {
				for (let j = 0; j < x[i].length; j++) {
					if (x[i][j] === 1) {
						this._w[j] *= this._alpha
					}
				}
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<0 | 1>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const r = data[i].reduce((s, v, d) => s + v * this._w[d], 0)
			p[i] = r <= this._th ? -1 : 1
		}
		return p
	}
}
