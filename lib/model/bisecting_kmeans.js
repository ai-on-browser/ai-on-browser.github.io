class KMeans {
	constructor(x) {
		this._x = x
		this._k = 2

		const n = this._x.length
		const idx = [Math.floor(Math.random() * n), Math.floor(Math.random() * (n - 1))]
		if (idx[0] === idx[1]) {
			idx[1] = n - 1
		}
		this._c = idx.map(v => this._x[v])
		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	get c() {
		return this._c
	}

	fit() {
		let isChanged = true
		while (isChanged) {
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
			isChanged = false
			for (let k = 0; k < this._k; k++) {
				const mc = c[k].map(v => v / count[k])
				isChanged |= mc.some((v, i) => v !== this._c[k][i])
				this._c[k] = mc
			}
		}
	}

	predict() {
		const p = []
		const n = this._x.length
		for (let i = 0; i < n; i++) {
			const d0 = this._d(this._x[i], this._c[0])
			const d1 = this._d(this._x[i], this._c[1])
			p[i] = d0 <= d1 ? 0 : 1
		}
		return p
	}
}

/**
 * Bisecting k-Means algorithm
 */
export default class BisectingKMeans {
	// A Comparison of Document Clustering Technique
	// https://www.philippe-fournier-viger.com/spmf/bisectingkmeans.pdf
	// https://scikit-learn.org/stable/modules/generated/sklearn.cluster.BisectingKMeans.html
	constructor() {
		this._c = []
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
	 * Fit model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const n = datas.length
		const d = datas[0].length
		if (this._c.length === 0) {
			this._c[0] = Array(d).fill(0)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < d; j++) {
					this._c[0][j] += datas[i][j]
				}
			}
			this._c[0] = this._c[0].map(v => v / n)
			return
		}

		const p = this.predict(datas)
		const ns = Array(this._c.length).fill(0)
		for (let i = 0; i < n; i++) {
			ns[p[i]]++
		}

		let max_k = 0
		for (let k = 1; k < this._c.length; k++) {
			if (ns[max_k] < ns[k]) {
				max_k = k
			}
		}
		if (ns[max_k] <= 1) {
			return
		}

		const xk = datas.filter((_, i) => p[i] === max_k)
		const model = new KMeans(xk)
		model.fit()
		this._c.splice(max_k, 1, ...model.c)
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
