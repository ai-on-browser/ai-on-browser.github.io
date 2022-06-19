/**
 * MONothetic Analysis Clustering
 */
export default class MONA {
	// https://stat.ethz.ch/R-manual/R-devel/library/cluster/html/mona.html
	constructor() {}

	/**
	 * Number of clusters
	 *
	 * @type {number}
	 */
	get size() {
		return this._tree.leafs.length
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<0 | 1>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		this._tree = {
			idx: Array.from({ length: this._x.length }, (_, i) => i),
			children: [],
			get leafs() {
				return this.children.length === 0 ? [this] : this.children.reduce((c, v) => c.concat(v.leafs), [])
			},
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		const leafs = this._tree.leafs
		const d = this._x[0].length
		for (const leaf of leafs) {
			let maxa = -Infinity
			let maxi = -1
			for (let i = 0; i < d; i++) {
				if (leaf.idx.every(k => this._x[k][i] === this._x[leaf.idx[0]][i])) {
					continue
				}
				let ta = 0
				for (let j = 0; j < d; j++) {
					if (i === j) {
						continue
					}
					let a = 0,
						b = 0,
						c = 0,
						d = 0
					for (const idx of leaf.idx) {
						if (this._x[idx][i] === 1 && this._x[idx][j] === 1) {
							a++
						} else if (this._x[idx][i] === 1 && this._x[idx][j] === 0) {
							b++
						} else if (this._x[idx][i] === 0 && this._x[idx][j] === 1) {
							c++
						} else if (this._x[idx][i] === 0 && this._x[idx][j] === 0) {
							d++
						}
					}
					ta += a * d - b * c
				}
				if (maxa < ta) {
					maxa = ta
					maxi = i
				}
			}
			if (maxi < 0) {
				continue
			}

			const v0 = leaf.idx.filter(v => this._x[v][maxi] === 0)
			const v1 = leaf.idx.filter(v => this._x[v][maxi] === 1)
			if (v0.length === 0 || v1.length === 0) {
				continue
			}
			leaf.feature = maxi
			leaf.children.push(
				{
					idx: v0,
					children: [],
					get leafs() {
						return this.children.length === 0
							? [this]
							: this.children.reduce((c, v) => c.concat(v.leafs), [])
					},
				},
				{
					idx: v1,
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

	/**
	 * Returns predicted categories.
	 *
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
