/**
 * Holt-Winters method
 */
export default class HoltWinters {
	// https://takuti.me/ja/note/holt-winters/
	/**
	 * @param {number} a
	 * @param {number} [b=0]
	 * @param {number} [g=0]
	 * @param {number} [s=0]
	 */
	constructor(a, b = 0, g = 0, s = 0) {
		this._a = a
		this._b = b
		this._g = g
		this._s = s
	}

	/**
	 * Fit model and return predict values.
	 *
	 * @param {number[]} x
	 * @returns {number[]}
	 */
	fit(x) {
		const f = [x[0]]
		this._level = x[0]
		this._trend = 0
		this._season = []
		for (let i = 0; i < this._s; i++) {
			this._season[i] = 0
		}

		for (let i = 1; i < x.length; i++) {
			const level =
				this._a * (this._s <= 0 ? x[i] : x[i] - this._season[i % this._s]) +
				(1 - this._a) * (this._level + this._trend)
			this._trend = this._b * (level - this._level) + (1 - this._b) * this._trend
			const ft = level + this._trend
			this._level = level
			if (this._s > 0) {
				this._season[i % this._s] = this._g * (x[i] - level) + (1 - this._g) * this._season[i % this._s]
			}
			f.push(ft)
		}
		this._step_offset = x.length + 1
		return f
	}

	/**
	 * Returns predicted future values.
	 *
	 * @param {number} k
	 * @returns {Array<Array<number>>}
	 */
	predict(k) {
		const pred = []
		for (let i = 0; i < k; i++) {
			let p = this._level + this._trend * (i + 1)
			if (this._s > 0) {
				p += this._season[(i + this._step_offset) % this._s]
			}
			pred.push(p)
		}
		return pred
	}
}
