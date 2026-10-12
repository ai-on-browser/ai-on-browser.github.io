/**
 * Kernel k-means
 */
export default class KernelKMeans {
	// http://ibisforest.org/index.php?%E3%82%AB%E3%83%BC%E3%83%8D%E3%83%ABk-means%E6%B3%95
	// https://research.miidas.jp/2019/07/kernel-kmeans%E3%81%AEnumpy%E5%AE%9F%E8%A3%85/
	/**
	 * @param {number} [k] Number of clusters
	 */
	constructor(k = 3) {
		this._k = k
		this._kernel = (a, b) => Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2))
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		this._labels = []
		this._K = []
		for (let i = 0; i < this._x.length; i++) {
			this._labels[i] = Math.floor(Math.random() * this._k)
			this._K[i] = []
			this._K[i][i] = this._kernel(this._x[i], this._x[i])
			for (let j = 0; j < i; j++) {
				const kij = this._kernel(this._x[i], this._x[j])
				this._K[i][j] = this._K[j][i] = kij
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._labels
	}

	/**
	 * Fit model.
	 */
	fit() {
		const cx = Array.from({ length: this._k }, () => [])
		for (let i = 0; i < this._x.length; i++) {
			cx[this._labels[i]].push(i)
		}
		const ink = Array(this._k).fill(0)
		for (let k = 0; k < this._k; k++) {
			for (let i = 0; i < cx[k].length; i++) {
				ink[k] += this._K[cx[k][i]][cx[k][i]]
				for (let j = 0; j < i; j++) {
					ink[k] += 2 * this._K[cx[k][i]][cx[k][j]]
				}
			}
			ink[k] /= cx[k].length ** 2
		}
		this._labels = this._x.map((_, i) => {
			let min_d = Infinity
			let min_i = -1
			for (let c = 0; c < this._k; c++) {
				let v = this._K[i][i] + ink[c]
				for (const j of cx[c]) {
					v -= (2 * this._K[i][j]) / cx[c].length
				}
				if (v < min_d) {
					min_d = v
					min_i = c
				}
			}
			return min_i
		})
	}
}
