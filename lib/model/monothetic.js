/**
 * Monothetic Clustering
 */
export default class MonotheticClustering {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.106.2839&rep=rep1&type=pdf
	// https://cran.r-project.org/web/packages/monoClust/vignettes/monoclust.html
	constructor() {}

	/**
	 * Number of clusters
	 * @type {number}
	 */
	get size() {
		return this._c.leafs.length
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		this._d = datas[0].length
		const idx = datas.map((_, i) => i)
		this._c = {
			index: idx,
			values: this._x,
			children: [],
			get leafs() {
				return this.children.length === 0 ? [this] : [...this.children[0].leafs, ...this.children[1].leafs]
			},
		}
	}

	_distance2(a, b) {
		return a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)
	}

	_inertia(c) {
		const m = c[0].concat()
		for (let i = 1; i < c.length; i++) {
			for (let d = 0; d < this._d; d++) {
				m[d] += c[i][d]
			}
		}
		for (let d = 0; d < this._d; d++) {
			m[d] /= c.length
		}

		let v = 0
		for (let i = 0; i < c.length; i++) {
			v += this._distance2(c[i], m)
		}
		return v
	}

	/**
	 * Fit model.
	 */
	fit() {
		const leafs = this._c.leafs

		let max_d = -Infinity
		let best_f = -1
		let best_t = -1
		let best_leaf = null
		for (let k = 0; k < leafs.length; k++) {
			const x = leafs[k].values
			const ck = this._inertia(x)
			for (let d = 0; d < this._d; d++) {
				const xd = x.map(v => v[d])
				xd.sort((a, b) => a - b)
				for (let i = 0; i < xd.length - 1; i++) {
					const t = (xd[i] + xd[i + 1]) / 2
					const x1 = x.filter(v => v[d] <= t)
					const x2 = x.filter(v => v[d] > t)
					const ck1 = this._inertia(x1)
					const ck2 = this._inertia(x2)

					const dck = ck - ck1 - ck2
					if (max_d < dck) {
						max_d = dck
						best_f = d
						best_t = t
						best_leaf = leafs[k]
					}
				}
			}
		}

		best_leaf.feature = best_f
		best_leaf.threshold = best_t
		best_leaf.children = [
			{
				index: best_leaf.index.filter((v, i) => best_leaf.values[i][best_f] <= best_t),
				values: best_leaf.values.filter(v => v[best_f] <= best_t),
				children: [],
				get leafs() {
					return this.children.length === 0 ? [this] : [...this.children[0].leafs, ...this.children[1].leafs]
				},
			},
			{
				index: best_leaf.index.filter((v, i) => best_leaf.values[i][best_f] > best_t),
				values: best_leaf.values.filter(v => v[best_f] > best_t),
				children: [],
				get leafs() {
					return this.children.length === 0 ? [this] : [...this.children[0].leafs, ...this.children[1].leafs]
				},
			},
		]
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		const leafs = this._c.leafs
		const p = []
		for (let k = 0; k < leafs.length; k++) {
			for (let i = 0; i < leafs[k].index.length; i++) {
				p[leafs[k].index[i]] = k
			}
		}
		return p
	}
}
