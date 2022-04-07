/**
 * Sobel edge detection
 */
export default class Sobel {
	// http://www.mis.med.akita-u.ac.jp/~kata/image/sobelprew.html
	/**
	 * @param {number} th Threshold
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
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @returns {Array<Array<boolean>>} Predicted values. `true` if a pixel is edge.
	 */
	predict(x) {
		const gx = this._convolute(x, [
			[1, 0, -1],
			[2, 0, -2],
			[1, 0, -1],
		])
		const gy = this._convolute(x, [
			[1, 2, 1],
			[0, 0, 0],
			[-1, -2, -1],
		])

		const g = []
		for (let i = 0; i < gx.length; i++) {
			g[i] = []
			for (let j = 0; j < gx[i].length; j++) {
				g[i][j] = Math.sqrt(gx[i][j] ** 2 + gy[i][j] ** 2) > this._threshold
			}
		}
		return g
	}
}
