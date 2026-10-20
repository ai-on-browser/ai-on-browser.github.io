/**
 * Stochastic Outlier Selection
 */
export default class SOS {
	// Stochastic Outlier Selection
	// https://github.com/jeroenjanssens/scikit-sos/blob/main/doc/sos-ticc-tr-2012-001.pdf
	/**
	 * @param {number} [h] Perplexity parameter
	 */
	constructor(h = 4.5) {
		this._h = h
	}

	_dissimilarity(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<number>>} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const d = []
		for (let i = 0; i < n; i++) {
			d[i] = []
			d[i][i] = 0
			for (let j = 0; j < i; j++) {
				d[i][j] = d[j][i] = this._dissimilarity(data[i], data[j])
			}
		}

		const b = []
		for (let i = 0; i < n; i++) {
			let sigma = 1
			let lowsigma = 0
			let highsigma = null
			const tol = 1.0e-8
			while (true) {
				const sgm = 2 * sigma ** 2
				const a = []
				let asum = 0
				for (let j = 0; j < n; j++) {
					a[j] = i === j ? 0 : Math.exp(-(d[i][j] ** 2) / sgm)
					asum += a[j]
				}
				const bi = a.map(v => v / asum)
				let h = 0
				for (let j = 0; j < n; j++) {
					if (i === j || bi[j] === 0) {
						continue
					}
					h -= bi[j] * Math.log2(bi[j])
				}
				const perp = 2 ** h
				if (Math.abs(perp - this._h) < tol) {
					b[i] = bi
					break
				} else if (perp < this._h) {
					lowsigma = sigma
					sigma = highsigma === null ? sigma * 2 : (sigma + highsigma) / 2
				} else {
					highsigma = sigma
					sigma = (sigma + lowsigma) / 2
				}
			}
		}
		const sos = []
		for (let i = 0; i < n; i++) {
			sos[i] = 1
			for (let j = 0; j < n; j++) {
				if (i === j) {
					continue
				}
				sos[i] *= 1 - b[j][i]
			}
		}
		return sos
	}
}
