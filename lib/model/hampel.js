/**
 * Hampel filter
 */
export default class HampelFilter {
	// https://jp.mathworks.com/help/signal/ref/hampel.html
	// https://towardsdatascience.com/outlier-detection-with-hampel-filter-85ddf523c73d
	// https://cpp-learning.com/hampel-filter/
	/**
	 * @param {number} k
	 * @param {number} th
	 */
	constructor(k = 3, th = 3) {
		this._k = k
		this._th = th
	}

	_median(a) {
		a.sort((a, b) => a - b)
		const n = a.length
		if (n % 2 === 1) {
			return a[(n - 1) / 2]
		}
		return (a[n / 2] + a[n / 2 - 1]) / 2
	}

	/**
	 * Returns predicted values.
	 * @param {number[]} x
	 * @returns {number[]}
	 */
	predict(x) {
		const p = []
		for (let i = 0; i < x.length; i++) {
			const s = Math.max(0, i - this._k)
			const e = Math.min(x.length - 1, i + this._k)
			const target = x.slice(s, e + 1)
			const mid = this._median(target)
			const std = 1.4826 * this._median(target.map(v => Math.abs(v - mid)))

			if (Math.abs(x[i] - mid) > this._th * std) {
				p.push(mid)
			} else {
				p.push(x[i])
			}
		}
		return p
	}
}
