/**
 * Hartigan-Wong k-Means algorithm
 */
export default class HartiganWongKMeans {
	// A K-Means Clustering Algorithm
	// Hartigan's K-means versus Lloyd's K-means: is it time for a change?.
	// https://www.ijcai.org/Proceedings/13/Papers/249.pdf
	// https://en.wikipedia.org/wiki/K-means_clustering
	/**
	 * @param {number} k Number of clusters
	 */
	constructor(k) {
		this._k = k
		this._c = null
		this._n = null
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
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		const n = this._x.length
		this._p = []
		this._c = []
		this._n = Array(this._k).fill(0)
		for (let i = 0; i < n; i++) {
			if (this._c.length < this._k) {
				this._p[i] = this._c.length
				this._c.push(this._x[i].concat())
				this._n[this._p[i]]++
				continue
			} else {
				this._p[i] = Math.floor(Math.random() * this._k)
				for (let j = 0; j < this._x[i].length; j++) {
					this._c[this._p[i]][j] += this._x[i][j]
				}
			}
			this._n[this._p[i]]++
		}
		for (let k = 0; k < this._k; k++) {
			this._c[k] = this._c[k].map(v => v / this._n[k])
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		const n = this._x.length

		for (let i = 0; i < n; i++) {
			const p = this._p[i]
			const d = (this._n[p] / (this._n[p] - 1)) * this._d(this._x[i], this._c[p]) ** 2
			let max_d = 0
			let max_k = -1
			for (let k = 0; k < this._k; k++) {
				if (p === k) continue
				const delta = d - (this._n[k] / (this._n[k] + 1)) * this._d(this._x[i], this._c[k]) ** 2
				if (delta > max_d) {
					max_d = delta
					max_k = k
				}
			}
			if (max_k >= 0) {
				this._c[p] = this._c[p].map((v, j) => (this._n[p] * v - this._x[i][j]) / (this._n[p] - 1))
				this._n[p]--
				this._c[max_k] = this._c[max_k].map(
					(v, j) => (this._n[max_k] * v + this._x[i][j]) / (this._n[max_k] + 1)
				)
				this._n[max_k]++
				this._p[i] = max_k
			}
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
