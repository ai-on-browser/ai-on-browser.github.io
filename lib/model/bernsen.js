import { Matrix } from '../util/math.js'

/**
 * Bernsen thresholding
 */
export default class BernsenThresholding {
	// https://gogowaten.hatenablog.com/entry/2020/05/29/135256
	// https://imagej.net/plugins/auto-local-threshold
	/**
	 * @param {number} n
	 * @param {number} ct
	 */
	constructor(n = 3, ct = 15) {
		this._n = n
		this._ct = ct
		this._th = 128
	}

	/**
	 * Returns thresholded values.
	 * @param {Array<Array<Array<number>>>} x
	 * @returns {(0 | 255)[]}
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
				const n = Matrix.fromArray(nears)
				const max = n.max(0)
				const min = n.min(0)
				const lc = max.copySub(min)
				const mid = max.copyAdd(min)
				mid.div(2)
				p[i][j] = lc.value.map((v, u) => {
					if (v < this._ct) {
						return mid.value[u] >= this._th ? 255 : 0
					} else {
						return x[i][j][u] >= mid.value[u] ? 255 : 0
					}
				})
			}
		}
		return p
	}
}
