/**
 * Drake's accelerated k-Means algorithm
 */
export default class DrakeKMeans {
	// Accelerated k-means with adaptive distance bounds
	// https://opt-ml.org/oldopt/papers/opt2012_paper_13.pdf
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
		this._t = Array(this._k).fill(0)

		this._y = []
		this._u = []
		this._a = []
		this._l = []
		const r = Array.from(this._c, (_, i) => i)
		for (let i = 0; i < n; i++) {
			this._a[i] = []
			this._l[i] = []
			this._sortCenters(i, this._b, r)
		}
	}

	_sortCenters(i, q, r) {
		const d = r.map(k => [this._d(this._c[k], this._x[i]), k])
		d.sort((a, b) => a[0] - b[0])
		this._y[i] = d[0][1]
		this._u[i] = d[0][0]
		for (let z = 0; z < q; z++) {
			this._a[i][z] = d[z + 1][1]
			this._l[i][z] = d[z + 1][0]
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		const n = this._x.length
		let b = Math.max(1, Math.floor(this._k / 8))
		for (let i = 0; i < n; i++) {
			let z = 0
			for (; z < this._b; z++) {
				if (this._u[i] <= this._l[i][z]) {
					break
				}
			}
			z = Math.min(z + 1, this._b)
			const r = [this._y[i], ...this._a[i].slice(0, z)]
			this._sortCenters(i, z, r)
			b = Math.max(b, z)
		}

		const mc = []
		const counts = Array(this._k).fill(0)
		for (let k = 0; k < this._k; k++) {
			mc[k] = Array(this._x[0].length).fill(0)
		}
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < this._x[i].length; j++) {
				mc[this._y[i]][j] += this._x[i][j]
			}
			counts[this._y[i]]++
		}
		let m = 0
		for (let k = 0; k < this._k; k++) {
			mc[k] = mc[k].map(v => v / counts[k])
			this._t[k] = this._d(this._c[k], mc[k])
			m = Math.max(m, this._t[k])
			this._c[k] = mc[k]
		}

		for (let i = 0; i < n; i++) {
			this._u[i] += this._t[this._y[i]]
			this._l[i][this._b] -= m
			for (let z = this._b - 1; z >= 0; z--) {
				this._l[i][z] -= this._t[this._a[i][z]]
				if (this._l[i][z] > this._l[i][z + 1]) {
					this._l[i][z] = this._l[i][z + 1]
				}
			}
		}
		this._b = b
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
