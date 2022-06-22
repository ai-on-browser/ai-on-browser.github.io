/**
 * Non-local means filter
 */
export default class NLMeans {
	// A non-local algorithm for image denoising
	// https://www.iro.umontreal.ca/~mignotte/IFT6150/Articles/Buades-NonLocal.pdf
	// https://qiita.com/tobira-code/items/018be1c231e66cc5e28e
	// https://qiita.com/Ushio/items/56a1c34a5a425ab6b0c2
	/**
	 * @param {number} n Manhattan distance of the pixel to the nearest neighbor
	 * @param {number} h Degree of filtering
	 */
	constructor(n, h) {
		this._h = h
		this._neighbor = n
	}

	_d(a, b) {
		return a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<Array<number>>>} x Training data
	 * @returns {Array<Array<Array<number>>>} Predicted values
	 */
	predict(x) {
		const v = []
		for (let i = 0; i < x.length; i++) {
			for (let j = 0; j < x[i].length; j++) {
				const nv = []
				for (let s = i - this._neighbor; s <= i + this._neighbor; s++) {
					for (let t = j - this._neighbor; t <= j + this._neighbor; t++) {
						const a = Math.max(0, Math.min(x.length - 1, s))
						const b = Math.max(0, Math.min(x[i].length - 1, t))
						nv.push(...x[a][b])
					}
				}
				v.push(nv)
			}
		}

		const d = []
		for (let i = 0; i < v.length; i++) {
			d[i] = []
			for (let j = 0; j <= i; j++) {
				const xd = Math.exp(-this._d(v[i], v[j]) / this._h ** 2)
				d[i][j] = d[j][i] = xd
			}
		}

		const pred = []
		for (let i = 0, p = 0; i < x.length; i++) {
			pred[i] = []
			for (let j = 0; j < x[i].length; j++, p++) {
				const wsum = Array(x[i][j].length).fill(0)
				let sum = 0
				for (let s = 0, q = 0; s < x.length; s++) {
					for (let t = 0; t < x[s].length; t++, q++) {
						const simi = d[p][q]
						sum += simi
						for (let d = 0; d < wsum.length; d++) {
							wsum[d] += simi * x[s][t][d]
						}
					}
				}
				pred[i][j] = wsum.map(v => v / sum)
			}
		}
		return pred
	}
}
