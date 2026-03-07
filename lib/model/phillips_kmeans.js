/**
 * Phillips' accelerated k-Means algorithm
 */
export default class PhillipsKMeans {
	// Acceleration of K-Means and Related Clustering Algorithms
	// https://www.nzdr.ru/data/media/biblio/kolxoz/Cs/CsLn/Algorithm%20Engineering%20and%20Experimentation,%204%20conf.,%20ALENEX%202002(LNCS2409,%20Springer,%202002)(ISBN%203540439773)(214s).pdf#page=174
	/**
	 * @param {number} k Number of clusters
	 */
	constructor(k) {
		this._k = k
		this._c = null
		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Centroids
	 * @type {Array<Array<number>>}
	 */
	get centroids() {
		return this._c
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		const n = this._x.length
		this._p = Array(n).fill(0)
		const idx = []
		for (let i = 0; i < this._k; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = idx.length - 1; i >= 0; i--) {
			for (let j = idx.length - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		this._c = idx.map(v => this._x[v])
	}

	/**
	 * Fit model.
	 */
	fit() {
		const D = []
		for (let i = 0; i < this._k; i++) {
			D[i] = []
			D[i][i] = 0
			for (let j = 0; j < i; j++) {
				D[i][j] = D[j][i] = this._d(this._c[i], this._c[j])
			}
		}
		for (let k = 0; k < this._k; k++) {
			D[k] = D[k].map((v, i) => ({ v, i }))
			D[k].sort((a, b) => a.v - b.v)
		}

		const n = this._x.length
		for (let i = 0; i < n; i++) {
			const c = this._p[i]
			let min_d = this._d(this._x[i], this._c[c])
			let min_k = c
			for (let k = 1; k < this._k; k++) {
				if (D[c][k].v >= 2 * min_d) {
					break
				}
				const d = this._d(this._x[i], this._c[D[c][k].i])
				if (d < min_d) {
					min_d = d
					min_k = D[c][k].i
				}
			}
			this._p[i] = min_k
		}

		this._c = []
		for (let k = 0; k < this._k; k++) {
			let cnt = 0
			this._c[k] = Array(this._x[0].length).fill(0)
			for (let i = 0; i < n; i++) {
				if (this._p[i] === k) {
					cnt++
					for (let j = 0; j < this._x[i].length; j++) {
						this._c[k][j] += this._x[i][j]
					}
				}
			}
			this._c[k] = this._c[k].map(v => v / cnt)
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._p
	}
}
