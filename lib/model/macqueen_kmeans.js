/**
 * MacQueen's k-Means algorithm
 */
export default class MacQueenKMeans {
	// Some methods for classification and analysis of multivariate observations
	/**
	 * @param {number} k Number of clusters
	 */
	constructor(k) {
		this._k = k
		this._c = []
		this._n = []
		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Centroids
	 *
	 * @type {Array<Array<number>>}
	 */
	get centroids() {
		return this._c
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const n = datas.length
		for (let i = 0; i < n; i++) {
			if (this._c.length < this._k) {
				this._c.push(datas[i].concat())
				this._n.push(1)
				continue
			}

			let min_d = Infinity
			let min_k = 0
			for (let k = 0; k < this._k; k++) {
				const d = this._d(datas[i], this._c[k])
				if (d < min_d) {
					min_d = d
					min_k = k
				}
			}
			this._c[min_k] = this._c[min_k].map((c, j) => (c * this._n[min_k] + datas[i][j]) / (this._n[min_k] + 1))
			this._n[min_k]++
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const p = []
		for (let i = 0; i < datas.length; i++) {
			let min_d = Infinity
			p[i] = -1
			for (let k = 0; k < this._c.length; k++) {
				const d = this._d(datas[i], this._c[k])
				if (d < min_d) {
					min_d = d
					p[i] = k
				}
			}
		}
		return p
	}
}
