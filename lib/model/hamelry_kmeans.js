/**
 * Hamelry's accelerated k-Means algorithm
 */
export default class HamelryKMeans {
	// Making k-means Even Faster
	// https://www.researchgate.net/publication/220906984_Making_k-means_Even_Faster
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
		this._q = Array(this._k).fill(0)
		this._cdash = []
		for (let k = 0; k < this._k; k++) {
			this._cdash[k] = Array(this._x[0].length).fill(0)
		}

		this._a = []
		this._u = []
		this._l = []
		for (let i = 0; i < n; i++) {
			this._u[i] = Infinity
			this._a[i] = 0
			this._l[i] = Infinity
			for (let k = 0; k < this._k; k++) {
				const d = this._d(this._x[i], this._c[k])
				if (d < this._u[i]) {
					this._l[i] = this._u[i]
					this._u[i] = d
					this._a[i] = k
				} else if (d[k] < this._l[i]) {
					this._l[i] = d
				}
			}
			this._q[this._a[i]]++
			for (let j = 0; j < this._x[i].length; j++) {
				this._cdash[this._a[i]][j] += this._x[i][j]
			}
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		const n = this._x.length
		const cd = []
		for (let i = 0; i < this._k; i++) {
			cd[i] = []
			cd[i][i] = 0
			for (let j = 0; j < i; j++) {
				cd[i][j] = cd[j][i] = this._d(this._c[i], this._c[j])
			}
		}
		const s = Array(this._k).fill(Infinity)
		for (let i = 0; i < this._k; i++) {
			for (let j = 0; j < this._k; j++) {
				if (i !== j && cd[i][j] < s[i]) {
					s[i] = cd[i][j]
				}
			}
		}

		for (let i = 0; i < n; i++) {
			const m = Math.max(s[this._a[i]] / 2, this._l[i])
			if (this._u[i] <= m) {
				continue
			}
			this._u[i] = this._d(this._x[i], this._c[this._a[i]])
			if (this._u[i] <= m) {
				continue
			}
			const ad = this._a[i]

			this._u[i] = Infinity
			this._a[i] = 0
			this._l[i] = Infinity
			for (let k = 0; k < this._k; k++) {
				const d = this._d(this._x[i], this._c[k])
				if (d < this._u[i]) {
					this._l[i] = this._u[i]
					this._u[i] = d
					this._a[i] = k
				} else if (d[k] < this._l[i]) {
					this._l[i] = d
				}
			}
			if (ad === this._a[i]) {
				continue
			}
			this._q[ad]--
			this._q[this._a[i]]++
			for (let j = 0; j < this._x[i].length; j++) {
				this._cdash[ad][j] -= this._x[i][j]
				this._cdash[this._a[i]][j] += this._x[i][j]
			}
		}

		const p = []
		for (let k = 0; k < this._k; k++) {
			const cstar = this._c[k]
			this._c[k] = this._cdash[k].map(v => v / this._q[k])
			p[k] = this._d(cstar, this._c[k])
		}
		const pidx = p.map((v, i) => [v, i])
		pidx.sort((a, b) => b[0] - a[0])
		const r = pidx[0][1]
		const rdash = pidx[0][2]
		for (let i = 0; i < n; i++) {
			this._u[i] += p[this._a[i]]
			this._l[i] -= p[this._a[i] === r ? rdash : r]
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
