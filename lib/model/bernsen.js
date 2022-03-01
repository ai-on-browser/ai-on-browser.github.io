/**
 * Bernsen thresholding
 */
export default class BernsenThresholding {
	// https://gogowaten.hatenablog.com/entry/2020/05/29/135256
	// https://imagej.net/plugins/auto-local-threshold
	/**
	 * @param {number} [n=3]
	 * @param {number} [ct=15]
	 */
	constructor(n = 3, ct = 15) {
		this._n = n
		this._ct = ct
		this._th = 128
	}

	/**
	 * Returns thresholded values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<0 | 1>>}
	 */
	predict(x) {
		const offset = Math.floor(this._n / 2)
		const p = []
		for (let i = 0; i < x.length; i++) {
			p[i] = []
			for (let j = 0; j < x[i].length; j++) {
				const nears = []
				for (let s = Math.max(0, i - offset); s <= Math.min(x.length - 1, i + offset); s++) {
					for (let t = Math.max(0, j - offset); t <= Math.min(x[i].length - 1, j + offset); t++) {
						nears.push(x[s][t])
					}
				}
				const max = Math.max(...nears)
				const min = Math.min(...nears)
				const lc = max - min
				const mid = (max + min) / 2
				if (lc < this._ct) {
					p[i][j] = mid >= this._th ? 1 : 0
				} else {
					p[i][j] = x[i][j] >= mid ? 1 : 0
				}
			}
		}
		return p
	}
}
