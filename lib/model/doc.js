/**
 * Density-based Optimal projective Clustering
 */
export class DOC {
	// A monte carlo algorithm for fast projective clustering
	// https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=f7a389eb1742d16cf09fc0d631cc0d1e97d49dda
	/**
	 * @param {number} alpha Dense scale
	 * @param {number} beta Balanced value
	 * @param {number} w Width of cluster
	 */
	constructor(alpha, beta, w) {
		this._alpha = alpha
		this._beta = beta
		this._w = w
		this._p = []
		this._d = []

		this._mu = (a, b) => a * (1 / this._beta) ** b
	}

	_select(n, k) {
		const idx = []
		for (let i = 0; i < k; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = idx.length - 1; i >= 0; i--) {
			for (let j = idx.length - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		return idx
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Sample data
	 */
	fit(datas) {
		const n = datas.length
		const d = datas[0].length
		const r = Math.min(n, Math.ceil(Math.log(2 * d) / Math.log(1 / (2 * this._beta))))
		const m = (2 / this._alpha) ** r * Math.log(4)
		let best_mu = 0
		let opt_cluster = []
		let opt_dim = []

		for (let i = 0; i < 2 / this._alpha; i++) {
			const p = datas[Math.floor(Math.random() * n)]
			for (let j = 0; j < m; j++) {
				const xi = this._select(n, r)
				const l = []
				const h = []

				const td = []
				for (let k = 0; k < d; k++) {
					if (xi.every(t => Math.abs(datas[t][k] - p[k]) <= this._w)) {
						td.push(k)
						l.push(p[k] - this._w)
						h.push(p[k] + this._w)
					} else {
						l.push(-Infinity)
						h.push(Infinity)
					}
				}
				const c = []
				for (let t = 0; t < n; t++) {
					if (datas[t].every((v, k) => l[k] <= v && v <= h[k])) {
						c.push(t)
					}
				}
				if (c.length < this._alpha * n) {
					continue
				}
				const mu = this._mu(c.length, td.length)
				if (best_mu < mu) {
					best_mu = mu
					opt_cluster = c
					opt_dim = td
				}
			}
		}

		const p = Array(n).fill(-1)
		for (let i = 0; i < opt_cluster.length; i++) {
			p[opt_cluster[i]] = 0
		}
		this._p = p
		this._d = opt_dim
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._p
	}
}

/**
 * Fast Density-based Optimal projective Clustering
 */
export class FastDOC {
	// A monte carlo algorithm for fast projective clustering
	// https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=f7a389eb1742d16cf09fc0d631cc0d1e97d49dda
	/**
	 * @param {number} alpha Dense scale
	 * @param {number} beta Balanced value
	 * @param {number} w Width of cluster
	 * @param {number} maxiter Maximum inner iteration
	 * @param {number} d0 Threshold of selected dimension count
	 */
	constructor(alpha, beta, w, maxiter, d0) {
		this._alpha = alpha
		this._beta = beta
		this._w = w
		this._maxiter = maxiter
		this._d0 = d0
		this._p = []
		this._d = []
	}

	_select(n, k) {
		const idx = []
		for (let i = 0; i < k; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = idx.length - 1; i >= 0; i--) {
			for (let j = idx.length - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		return idx
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Sample data
	 */
	fit(datas) {
		const n = datas.length
		const d = datas[0].length
		const r = Math.min(n, Math.ceil(Math.log(2 * d) / Math.log(1 / (2 * this._beta))))
		const m = Math.min(this._maxiter, (2 / this._alpha) ** r * Math.log(4))

		let opt_dim = []
		let opt_p = null

		for (let i = 0; i < 2 / this._alpha; i++) {
			const p = datas[Math.floor(Math.random() * n)]
			for (let j = 0; j < m; j++) {
				const xi = this._select(n, r)

				const td = []
				for (let k = 0; k < d; k++) {
					if (xi.every(t => Math.abs(datas[t][k] - p[k]) <= this._w)) {
						td.push(k)
					}
				}
				if (td.length >= opt_dim.length) {
					opt_dim = td
					opt_p = p
				}
				if (opt_dim.length >= this._d0) {
					break
				}
			}
			if (opt_dim.length >= this._d0) {
				break
			}
		}
		const l = Array.from({ length: d }, () => -Infinity)
		const h = Array.from({ length: d }, () => Infinity)

		for (let k = 0; k < opt_dim.length; k++) {
			l[opt_dim[k]] = opt_p[opt_dim[k]] - this._w
			h[opt_dim[k]] = opt_p[opt_dim[k]] + this._w
		}

		const p = Array(n).fill(-1)
		for (let t = 0; t < n; t++) {
			if (datas[t].every((v, k) => l[k] <= v && v <= h[k])) {
				p[t] = 0
			}
		}

		this._p = p
		this._d = opt_dim
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._p
	}
}
