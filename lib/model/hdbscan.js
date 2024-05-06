/**
 * Hierarchical Density-based spatial clustering of applications with noise
 */
export default class HDBSCAN {
	// https://qiita.com/ozaki_inu/items/45fb17cd3596a64ed489
	// https://hdbscan.readthedocs.io/en/latest/how_hdbscan_works.html
	// http://pdf.xuebalib.com:1262/2ac1mJln8ATx.pdf
	/**
	 * @param {number} [minClusterSize] Minimum number of clusters to be recognized as a cluster
	 * @param {number} [minPts] Number of neighborhood with core distance
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | function (number[], number[]): number} [metric] Metric name
	 */
	constructor(minClusterSize = 5, minPts = 5, metric = 'euclid') {
		this._minClusterSize = minClusterSize
		this._minPts = minPts

		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			switch (this._metric) {
				case 'euclid':
					this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
					break
				case 'manhattan':
					this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
					break
				case 'chebyshev':
					this._d = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])))
					break
			}
		}
	}

	/**
	 * Number of clusters of last predicted
	 * @type {number}
	 */
	get size() {
		if (!this._lastResult) {
			return 0
		}
		const y = new Set()
		for (let i = 0; i < this._lastResult.length; i++) {
			if (this._lastResult[i] >= 0) {
				y.add(this._lastResult[i])
			}
		}
		return y.size
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length

		const d = []
		const dmreach = []
		for (let i = 0; i < n; i++) {
			d[i] = []
			dmreach[i] = []
		}
		const dcore = []
		for (let i = 0; i < n; i++) {
			d[i][i] = 0
			for (let j = i + 1; j < n; j++) {
				d[i][j] = d[j][i] = this._d(datas[i], datas[j])
			}
			const ds = d[i].concat()
			ds.sort((a, b) => a - b)
			dcore[i] = ds[this._minPts]
		}
		for (let i = 0; i < n; i++) {
			dmreach[i][i] = 0
			for (let j = i + 1; j < n; j++) {
				dmreach[i][j] = dmreach[j][i] = Math.max(dcore[i], dcore[j], d[i][j])
			}
		}

		const tree = []
		for (let i = 0; i < n; i++) {
			tree[i] = { index: [i], distance: 0, children: [] }
		}
		while (tree.length > 1) {
			let min_i = -1
			let min_j = -1
			let min_d = Infinity
			const cn = tree.length
			for (let i = 0; i < cn; i++) {
				for (let j = i + 1; j < cn; j++) {
					if (dmreach[i][j] < min_d) {
						min_i = i
						min_j = j
						min_d = dmreach[i][j]
					}
				}
			}

			for (let k = 0; k < cn; k++) {
				if (k != min_j && k != min_i) {
					dmreach[min_i][k] = dmreach[k][min_i] = Math.min(dmreach[min_i][k], dmreach[min_j][k])
					dmreach[k].splice(min_j, 1)
				}
			}
			dmreach[min_i].splice(min_j, 1)
			dmreach.splice(min_j, 1)
			tree[min_i] = {
				distance: min_d,
				index: [...tree[min_i].index, ...tree[min_j].index],
				children: [tree[min_i], tree[min_j]],
			}
			tree.splice(min_j, 1)
		}

		const ctree = {}
		const stack = [[tree[0], ctree]]
		const clusters = []
		while (stack.length > 0) {
			let [tree, ctree] = stack.pop()
			ctree.index = tree.index
			ctree.lbirth = 1 / tree.distance
			ctree.stability = 0
			ctree.children = []
			clusters.push(ctree)
			while (true) {
				for (let i = tree.children.length - 1; i >= 0; i--) {
					const c = tree.children[i]
					if (c.index.length < this._minClusterSize) {
						tree.children.splice(i, 1)
						if (c.distance > 0) {
							ctree.stability += c.index.length * (1 / c.distance - ctree.lbirth)
						}
					}
				}
				if (tree.children.length === 0) {
					break
				} else if (tree.children.length === 1) {
					tree = tree.children[0]
				} else {
					for (let i = 0; i < tree.children.length; i++) {
						const ct = {}
						stack.push([tree.children[i], (ctree.children[i] = ct)])
					}
					break
				}
			}
		}

		for (let k = clusters.length - 1; k >= 0; k--) {
			const ck = clusters[k]
			if (ck.children.length <= 0) {
				continue
			}
			let cstab = 0
			for (let i = 0; i < ck.children.length; i++) {
				const c = ck.children[i]
				ck.stability += c.index.length * (c.lbirth - ck.lbirth)
				cstab += c.stability
			}
			if (ck.stability > cstab) {
				ck.isCluster = true
			} else {
				ck.stability = cstab
			}
		}

		let c = 0
		const cluster = Array(n).fill(-1)
		for (let k = 0; k < clusters.length; k++) {
			if (!clusters[k].isCluster) {
				continue
			}
			for (let i = 0; i < clusters[k].index.length; i++) {
				if (cluster[clusters[k].index[i]] < 0) {
					cluster[clusters[k].index[i]] = c
				}
			}
			c++
		}

		this._lastResult = cluster.concat()
		return cluster
	}
}
