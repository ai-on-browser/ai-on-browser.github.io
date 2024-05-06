/**
 * Cumulative sum change point detection
 */
export default class CumSum {
	// https://qiita.com/kokumura/items/e4c17d989aa3c34c6dd0
	constructor() {
		this._method = 'mean'
	}

	/**
	 * Initialize model.
	 * @param {number[]} datas Training data
	 */
	init(datas) {
		this._x = datas
		this._anom = Array(this._x.length).fill(false)
	}

	/**
	 * Fit model once.
	 */
	fit() {
		let i = 0
		while (i < this._anom.length) {
			let k = i
			for (; k < this._anom.length && !this._anom[k]; k++);
			let s = 0
			for (let t = i; t < k; t++) {
				s += this._x[t]
			}
			const m = s / (k - i)

			let d = 0
			let max = -Infinity
			let idx = -1
			for (let t = i; t < k; t++) {
				d += m - this._x[t]
				if (max < Math.abs(d)) {
					max = Math.abs(d)
					idx = t
				}
			}
			this._anom[idx] = true

			i = k + 1
		}
	}

	/**
	 * Returns predicted values.
	 * @returns {boolean[]} Predicted values
	 */
	predict() {
		return this._anom
	}
}
