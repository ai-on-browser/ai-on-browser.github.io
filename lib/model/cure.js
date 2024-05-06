import Matrix from '../util/matrix.js'

/**
 * @typedef {object} CURENode
 * @property {number[]} [point] Data point of leaf node
 * @property {number} [index] Data index of leaf node
 * @property {number[][]} [repr] Represented points
 * @property {number} [distance] Distance between children nodes
 * @property {number} size Number of leaf nodes
 * @property {CURENode[]} [children] Children nodes
 * @property {CURENode[]} leafs Leaf nodes
 */
/**
 * Clustering Using REpresentatives
 */
export default class CURE {
	// https://en.wikipedia.org/wiki/CURE_algorithm
	// http://ibisforest.org/index.php?CURE
	/**
	 * @param {number} c Number of representative points
	 */
	constructor(c) {
		this._c = c
		this._a = 0.2
		this._root = null
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} data Training data
	 */
	fit(data) {
		const clusters = []
		const distances = []
		data.forEach((v, i) => {
			clusters.push({
				point: v,
				index: i,
				repr: [v],
				distance: 0,
				get leafs() {
					return [this]
				},
			})
			distances[i] = data.map(p => this._distance(v, p))
		})

		while (clusters.length > 1) {
			let min_i = 0
			let min_j = 1
			let min_v = Infinity
			const n = clusters.length
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					if (distances[i][j] < min_v) {
						min_i = i
						min_j = j
						min_v = distances[i][j]
					}
				}
			}

			const i_datas = clusters[min_i].leafs.map(v => v.point)
			const j_datas = clusters[min_j].leafs.map(v => v.point)
			const new_datas = [...i_datas, ...j_datas]
			const repr_idx = []

			let pre_i = Math.floor(Math.random() * new_datas.length)
			for (let i = 0; i < Math.min(new_datas.length, this._c); i++) {
				let max_d = 0
				let max_i = -1
				for (let k = 0; k < new_datas.length; k++) {
					if (repr_idx.includes(k)) {
						continue
					}
					const d = this._distance(new_datas[k], new_datas[pre_i])
					if (d > max_d) {
						max_d = d
						max_i = k
					}
				}
				repr_idx.push(max_i)
				pre_i = max_i
			}

			const repr = []
			const mean = Matrix.fromArray(new_datas).mean(0).value
			for (let i = 0; i < repr_idx.length; i++) {
				repr[i] = new_datas[repr_idx[i]].concat()
				for (let d = 0; d < mean.length; d++) {
					repr[i][d] = this._a * mean[d] + (1 - this._a) * repr[i][d]
				}
			}

			for (let i = 0; i < n; i++) {
				if (i === min_i || i === min_j) {
					distances[min_i][i] = 0
					continue
				}
				let md = Infinity
				const iv = clusters[i]
				for (let s = 0; s < iv.repr.length; s++) {
					for (let t = 0; t < repr.length; t++) {
						const d = this._distance(iv.repr[s], repr[t])
						if (d < md) {
							md = d
						}
					}
				}
				distances[i][min_i] = distances[min_i][i] = md
				distances[i].splice(min_j, 1)
			}
			distances[min_i].splice(min_j, 1)
			distances.splice(min_j, 1)
			clusters[min_i] = {
				repr: repr,
				distance: min_v,
				children: [clusters[min_i], clusters[min_j]],
				get leafs() {
					return [...this.children[0].leafs, ...this.children[1].leafs]
				},
			}
			clusters.splice(min_j, 1)
		}
		this._root = clusters[0]
	}

	/**
	 * Returns the specified number of clusters.
	 * @param {number} number Number of clusters
	 * @returns {CURENode[]} Cluster nodes
	 */
	getClusters(number) {
		const scanNodes = [this._root]
		while (scanNodes.length < number) {
			let max_distance = 0
			let max_distance_idx = -1
			for (let i = 0; i < scanNodes.length; i++) {
				const node = scanNodes[i]
				if (node.children && node.distance > max_distance) {
					max_distance_idx = i
					max_distance = node.distance
				}
			}
			if (max_distance_idx === -1) {
				break
			}
			const max_distance_node = scanNodes[max_distance_idx]
			scanNodes.splice(max_distance_idx, 1, max_distance_node.children[0], max_distance_node.children[1])
		}
		return scanNodes
	}

	/**
	 * Returns predicted categories.
	 * @param {number} k Number of clusters
	 * @returns {number[]} Predicted values
	 */
	predict(k) {
		const p = []
		const clusters = this.getClusters(k)
		for (let i = 0; i < clusters.length; i++) {
			const leafs = clusters[i].leafs
			for (let k = 0; k < leafs.length; k++) {
				p[leafs[k].index] = i
			}
		}
		return p
	}
}
