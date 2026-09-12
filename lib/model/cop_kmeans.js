/**
 * Constrained K-means Algorithm
 */
export default class COPKMeans {
	// Constrained K-means Clustering with Background Knowledge
	// https://www.wkiri.com/research/papers/wagstaff-kmeans-01.pdf
	/**
	 * @param {number} k Number of clusters
	 */
	constructor(k) {
		this._k = k
		this._b = Math.max(1, Math.floor(k / 4))
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
	 * @param {Array<[number, number]>} mustlink Must-link constraints
	 * @param {Array<[number, number]>} cannotlink Cannot-link constraints
	 */
	init(datas, mustlink, cannotlink) {
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
		this._c = idx.map(v => this._x[v])

		this._mustlink = Array.from({ length: n }, () => [])
		for (const ml of mustlink) {
			this._mustlink[ml[0]][ml[1]] = true
			this._mustlink[ml[1]][ml[0]] = true
		}
		this._cannotlink = Array.from({ length: n }, () => [])
		for (const cl of cannotlink) {
			this._cannotlink[cl[0]][cl[1]] = true
			this._cannotlink[cl[1]][cl[0]] = true
		}
		this._fail = false
	}

	/**
	 * Fit model.
	 */
	fit() {
		if (this._fail) {
			return
		}
		const n = this._x.length
		const p = []
		for (let i = 0; i < n; i++) {
			const avail = Array(this._c.length).fill(true)
			for (let j = 0; j < i; j++) {
				if (this._mustlink[i][j]) {
					for (let k = 0; k < avail.length; k++) {
						if (k !== p[j]) {
							avail[k] = false
						}
					}
				}
				if (this._cannotlink[i][j]) {
					avail[p[j]] = false
				}
			}
			const dc = this._c
				.map((c, i) => [i, c])
				.filter((_, i) => avail[i])
				.map(c => [c[0], this._d(c[1], this._x[i])])
			if (dc.length === 0) {
				this._fail = true
				return
			}
			dc.sort((a, b) => a[1] - b[1])
			p[i] = dc[0][0]
		}

		const dim = this._x[0].length
		this._c = Array.from({ length: this._k }, () => Array(dim).fill(0))
		const cnt = Array(this._k).fill(0)
		for (let i = 0; i < n; i++) {
			cnt[p[i]]++
			for (let j = 0; j < dim; j++) {
				this._c[p[i]][j] += this._x[i][j]
			}
		}
		for (let k = 0; k < this._k; k++) {
			this._c[k] = this._c[k].map(v => v / cnt[k])
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		if (this._fail) {
			return Array.from(datas, () => -1)
		}
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
