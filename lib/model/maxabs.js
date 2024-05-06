/**
 * Max absolute scaler
 */
export default class MaxAbsScaler {
	/**
	 * Fit model.
	 * @param {number[] | Array<Array<number>>} x Training data
	 */
	fit(x) {
		if (Array.isArray(x[0])) {
			this._max = Array(x[0].length).fill(0)
			for (let i = 0; i < x.length; i++) {
				for (let k = 0; k < x[i].length; k++) {
					this._max[k] = Math.max(this._max[k], Math.abs(x[i][k]))
				}
			}

			for (let k = 0; k < this._max.length; k++) {
				if (this._max[k] === 0) {
					this._max[k] = 1
				}
			}
		} else {
			this._max = x.reduce((s, v) => Math.max(s, Math.abs(v)), 0)

			if (this._max === 0) {
				this._max = 1
			}
		}
	}

	/**
	 * Returns transformed values.
	 * @param {number[] | Array<Array<number>>} x Sample data
	 * @returns {number[] | Array<Array<number>>} Predicted values
	 */
	predict(x) {
		return x.map(r => {
			if (Array.isArray(r)) {
				if (Array.isArray(this._max)) {
					return r.map((v, i) => v / this._max[i])
				} else {
					return r.map(v => v / this._max)
				}
			}
			if (Array.isArray(this._max)) {
				return r / this._max[0]
			} else {
				return r / this._max
			}
		})
	}
}
