/**
 * Roberts cross
 */
export default class RobertsCross {
	// https://fussy.web.fc2.com/algo/image4_edge.htm
	// https://en.wikipedia.org/wiki/Roberts_cross
	/**
	 * @param {number} th
	 */
	constructor(th) {
		this._threshold = th
	}

	_convolute(x, kernel) {
		const a = []
		for (let i = 0; i < x.length; i++) {
			a[i] = []
			for (let j = 0; j < x[i].length; j++) {
				let v = 0
				for (let s = 0; s < kernel.length; s++) {
					let n = i + s - Math.floor(kernel.length / 2)
					n = Math.max(0, Math.min(x.length - 1, n))
					for (let t = 0; t < kernel[s].length; t++) {
						let m = j + t - Math.floor(kernel[s].length / 2)
						m = Math.max(0, Math.min(x[n].length - 1, m))
						v += x[n][m] * kernel[s][t]
					}
				}
				a[i][j] = v
			}
		}
		return a
	}

	/**
	 * Returns predicted edge flags.
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<boolean>>} true if a pixel is edge.
	 */
	predict(x) {
		const k1 = [
			[0, 1],
			[-1, 0],
		]
		const k2 = [
			[1, 0],
			[0, -1],
		]
		const g1 = this._convolute(x, k1)
		const g2 = this._convolute(x, k2)

		const g = []
		for (let i = 0; i < g1.length; i++) {
			g[i] = []
			for (let j = 0; j < g1[i].length; j++) {
				g[i][j] = Math.sqrt(g1[i][j] ** 2 + g2[i][j] ** 2) > this._threshold
			}
		}
		return g
	}
}
