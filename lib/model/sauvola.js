/**
 * sauvola thresholding
 */
export default class SauvolaThresholding {
	// https://schima.hatenablog.com/entry/2013/10/19/085019
	/**
	 * @param {number} n
	 * @param {number} k
	 * @param {number} r
	 */
	constructor(n = 3, k = 0.1, r = 1) {
		this._n = n
		this._k = k
		this._r = r
	}

	/**
	 * Returns thresholded values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<0 | 255>>}
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
				const m = nears.reduce((s, v) => s + v, 0) / nears.length
				const s = Math.sqrt(nears.reduce((s, v) => s + (v - m) ** 2, 0) / nears.length)
				p[i][j] = x[i][j] < m * (1 + this._k * (s / this._r - 1)) ? 0 : 255
			}
		}
		return p
	}
}
