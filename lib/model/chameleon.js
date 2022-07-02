import Graph from '../util/graph.js'

/**
 * CHAMELEON
 */
export default class CHAMELEON {
	// CHAMELEON: A Hierarchical Clustering Algorithm Using Dynamic Modeling
	/**
	 * @param {number} [k=5] Number of neighborhoods
	 */
	constructor(k = 5) {
		this._k = k
		this._minSize = 0.05
		this._t_ri = 0
		this._t_rc = 0
		this._alpha = 1
	}

	_sim(a, b) {
		return Math.exp(-(this._d(a, b) ** 2) / 2)
	}

	_d(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const n = datas.length
		const minsize = this._minSize < 1 ? n * this._minSize : this._minSize
		const dists = []
		for (let i = 0; i < n; i++) {
			dists[i] = []
			dists[i][i] = 0
			for (let j = 0; j < i; j++) {
				dists[i][j] = dists[j][i] = this._d(datas[i], datas[j])
			}
		}
		const cons = []
		const mutg = []
		for (let i = 0; i < n; i++) {
			const d = dists[i].map((v, k) => [v, k])
			d.sort((a, b) => a[0] - b[0])
			const nears = d.slice(1, this._k + 1)
			cons[i] = Array(n).fill(false)
			for (let k = 0; k < nears.length; k++) {
				cons[i][nears[k][1]] = true
			}

			mutg[i] = Array(n).fill(0)
			for (let j = 0; j < i; j++) {
				if (cons[i][j] || cons[j][i]) {
					mutg[i][j] = mutg[j][i] = this._sim(datas[i], datas[j])
				}
			}
		}

		let clusters = [Array.from({ length: n }, (_, i) => i)]
		while (true) {
			const newclusters = []
			for (let k = 0; k < clusters.length; k++) {
				const cluster = clusters[k]
				if (cluster.length < minsize) {
					newclusters.push(cluster)
					continue
				}
				const am = []
				for (let i = 0; i < cluster.length; i++) {
					am[i] = []
					for (let j = 0; j < cluster.length; j++) {
						am[i][j] = mutg[cluster[i]][cluster[j]]
					}
				}
				const g = Graph.fromAdjacency(am)
				let [, clust] = g.mincut(Math.ceil(g.order / 4))

				if (clust.every(c => c.length < minsize)) {
					newclusters.push(cluster)
				} else {
					newclusters.push(...clust.map(c => c.map(i => cluster[i])))
				}
			}
			if (clusters.length === newclusters.length) {
				break
			}
			clusters = newclusters
		}

		const ec = []
		const ecsize = []
		for (let i = 0; i < clusters.length; i++) {
			const cluster = clusters[i]
			ec[i] = []
			ecsize[i] = []

			const [eci, ecnt] = this._roughly_bisect(mutg, cluster)
			ec[i][i] = eci
			ecsize[i][i] = ecnt
			for (let j = 0; j < i; j++) {
				ec[i][j] = 0
				let ecnt = 0
				for (let s = 0; s < cluster.length; s++) {
					for (let t = 0; t < clusters[j].length; t++) {
						if (mutg[cluster[s]][clusters[j][t]]) {
							ec[i][j] += mutg[cluster[s]][clusters[j][t]]
							ecnt++
						}
					}
				}
				ec[j][i] = ec[i][j]
				ecsize[i][j] = ecsize[j][i] = ecnt
			}
		}

		const nodes = clusters.map(c => ({ idx: c }))

		while (nodes.length > 1) {
			let maxt = -Infinity
			let maxi = -1
			let maxj = -1
			for (let i = 0; i < nodes.length; i++) {
				for (let j = i + 1; j < nodes.length; j++) {
					const ri = Math.abs(ec[i][j]) / ((Math.abs(ec[i][i]) + Math.abs(ec[j][j])) / 2)
					const ci = nodes[i].idx.length
					const cj = nodes[j].idx.length
					if (ecsize[i][j] === 0 || ecsize[i][i] === 0 || ecsize[j][j] === 0) {
						continue
					}
					const secij = ec[i][j] / ecsize[i][j]
					const secii = ec[i][i] / ecsize[i][i]
					const secjj = ec[j][j] / ecsize[j][j]
					const rc = secij / ((ci / (ci + cj)) * secii + (cj / (ci + cj)) * secjj)

					if (ri < this._t_ri || rc < this._t_rc) {
						continue
					}
					const t = ri * rc ** this._alpha
					if (t > maxt) {
						maxt = t
						maxi = i
						maxj = j
					}
				}
			}
			if (maxt === -Infinity) {
				break
			}

			nodes[maxi] = {
				idx: [...nodes[maxi].idx, ...nodes[maxj].idx],
				children: [nodes[maxi], nodes[maxj]],
				t: maxt,
			}
			nodes.splice(maxj, 1)
			for (let i = 0; i < ec.length; i++) {
				if (i === maxj) {
					continue
				} else if (i === maxi) {
					const [eci, ecnt] = this._roughly_bisect(mutg, nodes[maxi].idx)
					ec[i][i] = eci
					ecsize[i][i] = ecnt
				} else {
					ec[i][maxi] += ec[i][maxj]
					ecsize[i][maxi] += ecsize[i][maxj]
					ec[maxi][i] += ec[maxj][i]
					ecsize[maxi][i] += ecsize[maxj][i]
				}
				ecsize[i].splice(maxj, 1)
				ec[i].splice(maxj, 1)
			}
			ec.splice(maxj, 1)
			ecsize.splice(maxj, 1)
		}
		this._root = nodes
	}

	_roughly_bisect(graph, cluster) {
		if (cluster.length <= 1) {
			return [0, [cluster]]
		}
		const am = []
		for (let i = 0; i < cluster.length; i++) {
			am[i] = []
			for (let j = 0; j < cluster.length; j++) {
				am[i][j] = graph[cluster[i]][cluster[j]]
			}
		}
		const g = Graph.fromAdjacency(am)
		const [eci, cutnodes] = g.bisectionSpectral()
		let ecnt = 0
		for (let s = 0; s < cutnodes[0].length; s++) {
			for (let t = 0; t < cutnodes[1].length; t++) {
				if (am[cutnodes[0][s]][cutnodes[1][t]]) {
					ecnt += am[cutnodes[0][s]][cutnodes[1][t]]
				}
			}
		}
		return [eci, ecnt]
	}

	/**
	 * Returns the specified number of clusters.
	 *
	 * @param {number} number Number of clusters
	 * @returns {*[]} Cluster nodes
	 */
	getClusters(number) {
		const scanNodes = [...this._root]
		while (scanNodes.length < number) {
			let min_t = Infinity
			let min_t_idx = -1
			for (let i = 0; i < scanNodes.length; i++) {
				const node = scanNodes[i]
				if (node.children && node.t < min_t) {
					min_t_idx = i
					min_t = node.t
				}
			}
			if (min_t_idx === -1) {
				break
			}
			const max_distance_node = scanNodes[min_t_idx]
			scanNodes.splice(min_t_idx, 1, max_distance_node.children[0], max_distance_node.children[1])
		}
		return scanNodes
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {number} k Number of clusters
	 * @returns {number[]} Predicted values
	 */
	predict(k) {
		const categories = []
		const clusters = this.getClusters(k)
		for (let k = 0; k < clusters.length; k++) {
			for (const i of clusters[k].idx) {
				categories[i] = k
			}
		}
		return categories
	}
}
