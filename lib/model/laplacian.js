/**
 * Laplacian edge detection
 */
export default class Laplacian {
	// https://algorithm.joho.info/image-processing/laplacian-filter/
	/**
	 * @param {number} th Threshold
	 * @param {4 | 8} [n=4] Number of neighborhoods
	 */
	constructor(th, n = 4) {
		this._threshold = th
		this._n = n
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
		let k = null
		if (this._n === 4) {
			k = [
				[0, 1, 0],
				[1, -4, 1],
				[0, 1, 0],
			]
		} else {
			k = [
				[1, 1, 1],
				[1, -8, 1],
				[1, 1, 1],
			]
		}
		const gl = this._convolute(x, k)

		const g = []
		for (let i = 0; i < gl.length; i++) {
			g[i] = []
			for (let j = 0; j < gl[i].length; j++) {
				g[i][j] = gl[i][j] > this._threshold
			}
		}
		return g
	}
}
