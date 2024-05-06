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

	_distance(x, c) {
		const cx = this._x.filter((v, i) => this._labels[i] === c)
		let v = this._kernel(x, x)
		for (let i = 0; i < cx.length; i++) {
			v -= (2 * this._kernel(x, cx[i])) / cx.length
		}
		for (let i = 0; i < cx.length; i++) {
			v += this._kernel(cx[i], cx[i]) / cx.length ** 2
			for (let j = 0; j < i; j++) {
				v += (2 * this._kernel(cx[i], cx[j])) / cx.length ** 2
			}
		}
		return v
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		this._labels = []
		for (let i = 0; i < this._x.length; i++) {
			this._labels[i] = Math.floor(Math.random() * this._k)
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
		this._labels = this._x.map(value => {
			let min_d = Infinity
			let min_i = -1
			for (let i = 0; i < this._k; i++) {
				const d = this._distance(value, i)
				if (d < min_d) {
					min_d = d
					min_i = i
				}
			}
			return min_i
		})
	}
}
