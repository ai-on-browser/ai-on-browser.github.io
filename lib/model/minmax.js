/**
 * Min-max normalization
 */
export default class MinmaxNormalization {
	/**
	 * @param {number} [min=0]
	 * @param {number} [max=1]
	 */
	constructor(min = 0, max = 1) {
		this._min = min
		this._max = max
	}

	/**
	 * Fit model.
	 *
	 * @param {number[] | Array<Array<number>>} x
	 */
	fit(x) {
		if (Array.isArray(x[0])) {
			this._d_min = Array(x[0].length).fill(Infinity)
			this._d_max = Array(x[0].length).fill(-Infinity)
			for (let i = 0; i < x.length; i++) {
				for (let k = 0; k < x[i].length; k++) {
					this._d_min[k] = Math.min(this._d_min[k], x[i][k])
					this._d_max[k] = Math.max(this._d_max[k], x[i][k])
				}
			}

			for (let k = 0; k < this._d_min.length; k++) {
				if (this._d_min[k] === this._d_max[k]) {
					this._d_max[k] += 1
				}
			}
		} else {
			this._d_min = x.reduce((s, v) => Math.min(s, v), Infinity)
			this._d_max = x.reduce((s, v) => Math.max(s, v), -Infinity)

			if (this._d_min === this._d_max) {
				this._d_max += 1
			}
		}
	}

	/**
	 * Returns transformed values.
	 *
	 * @param {number[] | Array<Array<number>>} x
	 * @returns {number[] | Array<Array<number>>}
	 */
	predict(x) {
		return x.map(r => {
			if (Array.isArray(r)) {
				if (Array.isArray(this._d_min)) {
					return r.map((v, i) => (v - this._d_min[i]) / (this._d_max[i] - this._d_min[i]))
				} else {
					return r.map(v => (v - this._d_min) / (this._d_max - this._d_min))
				}
			}
			if (Array.isArray(this._d_min)) {
				return (r - this._d_min[0]) / (this._d_max[0] - this._d_min[0])
			} else {
				return (r - this._d_min) / (this._d_max - this._d_min)
			}
		})
	}
}
