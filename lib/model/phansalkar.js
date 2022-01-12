/**
 * Phansalkar thresholding
 */
export default class PhansalkarThresholding {
	// https://gogowaten.hatenablog.com/entry/2020/05/29/135256
	// https://imagej.net/plugins/auto-local-threshold
	/**
	 * @param {number} n
	 * @param {number} k
	 * @param {number} r
	 * @param {number} p
	 * @param {number} q
	 */
	constructor(n = 3, k = 0.25, r = 0.5, p = 2, q = 10) {
		this._n = n
		this._k = k
		this._r = r
		this._p = p
		this._q = q
	}

	/**
	 * Returns thresholded values.
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
				const t = m * (1 + this._p * Math.exp(-this._q * m) + this._k * (s / this._r - 1))
				p[i][j] = x[i][j] < t ? 0 : 255
			}
		}
		return p
	}
}
