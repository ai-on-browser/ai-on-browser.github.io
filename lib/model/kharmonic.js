/**
 * K-Harmonic Means
 */
export default class KHarmonicMeans {
	// K-Harmonic Means - A Data Clustering Algorithm
	// https://www.hpl.hp.com/techreports/1999/HPL-1999-124.pdf
	/**
	 * @param {number} k Number of clusters
	 */
	constructor(k) {
		this._k = k
		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Centroids
	 * @type {Array<Array<number>>}
	 */
	get centroids() {
		return this._m
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		const n = this._x.length
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
		this._m = idx.map(v => this._x[v])
	}

	/**
	 * Fit model.
	 */
	fit() {
		const n = this._x.length
		const q = []
		for (let i = 0; i < n; i++) {
			const d = this._m.map(m => this._d(this._x[i], m))
			const dmin = d.reduce((m, v, k) => (v < m[0] ? [v, k] : m), [Infinity, -1])

			q[i] = []
			for (let k = 0; k < this._k; k++) {
				const normd = k === dmin[1] ? 1 : dmin[0] / d[k]
				q[i][k] = (normd ** 3 * dmin[0]) / (1 + (k === dmin[1] ? 0 : normd ** 2)) ** 2
			}
		}

		for (let k = 0; k < this._k; k++) {
			let s = 0
			const m = Array(this._m[k].length).fill(0)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < this._x[i].length; j++) {
					m[j] += q[i][k] * this._x[i][j]
				}
				s += q[i][k]
			}
			this._m[k] = m.map(v => v / s)
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const p = []
		for (let i = 0; i < datas.length; i++) {
			let min_d = Infinity
			let min_k = -1
			for (let k = 0; k < this._m.length; k++) {
				const d = this._d(datas[i], this._m[k])
				if (d < min_d) {
					min_d = d
					min_k = k
				}
			}
			p[i] = min_k
		}
		return p
	}
}
