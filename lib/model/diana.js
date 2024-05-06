/**
 * DIvisive ANAlysis Clustering
 */
export default class DIANA {
	// https://www.slideshare.net/sesejun/datamining-8th-hclustering
	constructor() {}

	/**
	 * Number of clusters
	 * @type {number}
	 */
	get size() {
		return this._tree.leafs.length
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		this._tree = {
			idx: datas.map((_, i) => i),
			children: [],
			get leafs() {
				return this.children.length === 0 ? [this] : this.children.reduce((c, v) => c.concat(v.leafs), [])
			},
		}
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_v(i, v, s) {
		let a = 0
		for (let k = 0; k < v.length; k++) {
			if (v[k] !== i && !s.includes(v[k])) {
				a += this._distance(this._x[i], this._x[v[k]])
			}
		}
		a = a / (v.length - s.length - 1)

		if (s.length > 0) {
			let b = 0
			for (let k = 0; k < s.length; k++) {
				b += this._distance(this._x[i], this._x[s[k]])
			}
			a -= b / s.length
		}
		return a
	}

	/**
	 * Fit model.
	 */
	fit() {
		for (const leaf of this._tree.leafs) {
			if (leaf.idx.length === 1) {
				continue
			}

			const s = []
			while (s.length < leaf.idx.length) {
				let max_v = -Infinity
				let max_i = -1
				for (let i = 0; i < leaf.idx.length; i++) {
					if (s.includes(leaf.idx[i])) continue
					const a = this._v(leaf.idx[i], leaf.idx, s)
					if (max_v < a) {
						max_v = a
						max_i = leaf.idx[i]
					}
				}
				if (max_v <= 0) break
				s.push(max_i)
			}

			if (0 < s.length && s.length < leaf.idx.length) {
				const s0 = leaf.idx.filter(a => !s.includes(a))
				leaf.children.push(
					{
						idx: s,
						children: [],
						get leafs() {
							return this.children.length === 0
								? [this]
								: this.children.reduce((c, v) => c.concat(v.leafs), [])
						},
					},
					{
						idx: s0,
						children: [],
						get leafs() {
							return this.children.length === 0
								? [this]
								: this.children.reduce((c, v) => c.concat(v.leafs), [])
						},
					}
				)
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		const p = []
		const leafs = this._tree.leafs
		for (let k = 0; k < leafs.length; k++) {
			for (const i of leafs[k].idx) {
				p[i] = k
			}
		}
		return p
	}
}
