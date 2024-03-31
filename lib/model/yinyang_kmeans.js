class KMeans {
	constructor(x, k) {
		this._x = x
		this._k = k

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

		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	get c() {
		return this._c
	}

	fit() {
		const p = this.predict()

		const c = this._c.map(p => Array.from(p, () => 0))
		const count = Array(this._k).fill(0)
		const n = this._x.length
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < this._x[i].length; j++) {
				c[p[i]][j] += this._x[i][j]
			}
			count[p[i]]++
		}
		for (let k = 0; k < this._k; k++) {
			this._c[k] = c[k].map(v => v / count[k])
		}
	}

	predict() {
		const p = []
		const n = this._x.length
		for (let i = 0; i < n; i++) {
			let min_d = Infinity
			p[i] = -1
			for (let k = 0; k < this._k; k++) {
				const d = this._d(this._x[i], this._c[k])
				if (d < min_d) {
					min_d = d
					p[i] = k
				}
			}
		}
		return p
	}
}

/**
 * Yinyang k-Means algorithm
 */
export default class YinyangKMeans {
	// Yinyang k-means: A drop-in replacement of the classic k-means with consistent speedup
	// https://proceedings.mlr.press/v37/ding15.pdf
	// https://proceedings.mlr.press/v48/bottesch16.pdf
	/**
	 * @param {number} k Number of clusters
	 * @param {number} [t] Number of groups
	 */
	constructor(k, t) {
		this._k = k
		this._t = Math.max(1, t ?? Math.floor(this._k / 10))
		this._c = null
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

		const mdl = new KMeans(this._x, this._k)
		const gmdl = new KMeans(mdl.c, this._t)
		for (let i = 0; i < 5; i++) {
			gmdl.fit()
		}
		const g = gmdl.predict()
		this._g = Array.from({ length: this._t }, () => [])
		for (let i = 0; i < g.length; i++) {
			this._g[g[i]].push(i)
		}

		mdl.fit()
		this._c = mdl.c
		this._b = mdl.predict()
		this._ub = []
		this._lb = []
		const n = this._x.length
		for (let i = 0; i < n; i++) {
			this._ub[i] = this._d(this._x[i], this._c[this._b[i]])
			this._lb[i] = []
			for (let t = 0; t < this._t; t++) {
				this._lb[i][t] = Infinity
				for (let j = 0; j < this._g[t].length; j++) {
					if (this._g[t][j] === this._b[i]) continue
					const d = this._d(this._x[i], this._c[this._g[t][j]])
					if (d < this._lb[i][t]) {
						this._lb[i][t] = d
					}
				}
			}
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		const n = this._x.length

		const c = this._c.map(p => Array.from(p, () => 0))
		const count = Array(this._k).fill(0)
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < this._x[i].length; j++) {
				c[this._b[i]][j] += this._x[i][j]
			}
			count[this._b[i]]++
		}
		const delta_c = []
		for (let k = 0; k < this._k; k++) {
			c[k] = c[k].map(v => v / count[k])
			delta_c[k] = this._d(this._c[k], c[k])
			this._c[k] = c[k]
		}
		const delta_g = []
		for (let t = 0; t < this._t; t++) {
			delta_g[t] = 0
			for (let j = 0; j < this._g[t].length; j++) {
				delta_g[t] = Math.max(delta_g[t], delta_c[this._g[t][j]])
			}
		}

		for (let i = 0; i < n; i++) {
			this._ub[i] += delta_c[this._b[i]]
			const lb_old = []

			let min_lb = Infinity
			for (let t = 0; t < this._t; t++) {
				lb_old[t] = this._lb[i][t]
				this._lb[i][t] -= delta_g[t]
				min_lb = Math.min(min_lb, this._lb[i][t])
			}
			const b_old = this._b[i]

			if (min_lb >= this._ub[i]) continue
			this._ub[i] = this._d(this._x[i], this._c[this._b[i]])
			if (min_lb >= this._ub[i]) continue

			const ghat = []
			for (let t = 0; t < this._t; t++) {
				if (this._lb[i][t] >= this._ub[i]) {
					continue
				}
				ghat.push(t)
				this._lb[i][t] = Infinity

				for (const j of this._g[t]) {
					if (b_old === j) continue
					if (this._lb[i][t] < lb_old[t] - delta_c[j]) continue
					const d = this._d(this._x[i], this._c[j])
					if (d < this._ub[i]) {
						let l = 0
						for (; !this._g[l].includes(this._b[i]); l++);
						this._lb[i][l] = this._ub[i]
						this._ub[i] = d
						this._b[i] = j
					} else if (d < this._lb[i][t]) {
						this._lb[i][t] = d
					}
				}
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
