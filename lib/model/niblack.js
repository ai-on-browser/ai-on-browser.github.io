/**
 * Niblack thresholding
 */
export default class NiblackThresholding {
	// https://schima.hatenablog.com/entry/2013/10/19/085019
	// https://www.kite.com/python/docs/skimage.filters.threshold_niblack
	/**
	 * @param {number} [n=3]
	 * @param {number} [k=0.1]
	 */
	constructor(n = 3, k = 0.1) {
		this._n = n
		this._k = k
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
				p[i][j] = x[i][j] < m - s * this._k ? 0 : 255
			}
		}
		return p
	}
}
