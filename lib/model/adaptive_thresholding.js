/**
 * Adaptive thresholding
 */
export default class AdaptiveThresholding {
	// https://algorithm.joho.info/image-processing/adaptive-thresholding/
	// https://docs.opencv.org/master/d7/d4d/tutorial_py_thresholding.html
	/**
	 * Constructor
	 * @param {'mean' | 'gaussian' | 'median' | 'midgray'} method
	 * @param {number} k
	 * @param {number} c
	 */
	constructor(method = 'mean', k = 3, c = 2) {
		this._method = method
		this._k = k
		this._c = c
	}

	_kernel() {
		const k = []
		for (let i = 0; i < this._k; k[i++] = Array(this._k).fill(1 / this._k ** 2));
		if (this._method === 'gaussian') {
			const s = 1.3
			const offset = Math.floor(this._k / 2)
			let total = 0
			for (let i = 0; i < this._k; i++) {
				for (let j = 0; j < this._k; j++) {
					const x = i - offset
					const y = j - offset
					const v = Math.exp(-(x ** 2 + y ** 2) / (2 * s ** 2))
					k[i][j] = v
					total += v
				}
			}
			for (let i = 0; i < this._k; i++) {
				for (let j = 0; j < this._k; j++) {
					k[i][j] /= total
				}
			}
		}
		return k
	}

	/**
	 * Returns thresholded values.
	 * @param {Array<Array<Array<number>>>} x
	 * @returns {Array<Array<Array<0 | 255>>>}
	 */
	predict(x) {
		switch (this._method) {
			case 'mean':
			case 'gaussian':
				return this._predict_kernel(x)
			case 'median':
			case 'midgray':
				return this._predict_statistics(x)
		}
	}

	_predict_kernel(x) {
		const p = []
		const kernel = this._kernel()
		for (let i = 0; i < x.length; i++) {
			p[i] = []
			for (let j = 0; j < x[i].length; j++) {
				const d = x[i][j].length
				const m = Array(d).fill(0)
				let ksum = 0
				for (let s = 0; s < kernel.length; s++) {
					const s0 = i + s - (kernel.length - 1) / 2
					if (s0 < 0 || x.length <= s0) {
						continue
					}
					for (let t = 0; t < kernel[s].length; t++) {
						const t0 = j + t - (kernel[s].length - 1) / 2
						if (t0 < 0 || x[i].length <= t0) {
							continue
						}
						for (let u = 0; u < d; u++) {
							m[u] += kernel[s][t] * x[s0][t0][u]
						}
						ksum += kernel[s][t]
					}
				}
				p[i][j] = m.map((v, u) => (x[i][j][u] < v / ksum - this._c ? 0 : 255))
			}
		}
		return p
	}

	_predict_statistics(x) {
		const p = []
		for (let i = 0; i < x.length; i++) {
			p[i] = []
			for (let j = 0; j < x[i].length; j++) {
				const d = x[i][j].length
				const m = []
				for (let u = 0; u < d; m[u++] = []);
				for (let s = 0; s < this._k; s++) {
					const s0 = i + s - (this._k - 1) / 2
					if (s0 < 0 || x.length <= s0) {
						continue
					}
					for (let t = 0; t < this._k; t++) {
						const t0 = j + t - (this._k - 1) / 2
						if (t0 < 0 || x[i].length <= t0) {
							continue
						}
						for (let u = 0; u < d; u++) {
							m[u].push(x[s0][t0][u])
						}
					}
				}
				p[i][j] = []
				for (let u = 0; u < d; u++) {
					m[u].sort((a, b) => a - b)
					if (this._method === 'median') {
						const v = m[u].length % 2 === 0 ? m[u][m[u].length / 2 - 1] : m[u][(m[u].length - 1) / 2]
						p[i][j][u] = x[i][j][u] < v - this._c ? 0 : 255
					} else if (this._method === 'midgray') {
						const v = (m[u][0] + m[u][m[u].length - 1]) / 2
						p[i][j][u] = x[i][j][u] < v - this._c ? 0 : 255
					}
				}
			}
		}
		return p
	}
}
