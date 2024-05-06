/**
 * Clustering based on Closest Pairs
 */
export default class C2P {
	// C2P: Clustering based on Closest Pairs
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.61.7530&rep=rep1&type=pdf
	/**
	 * @param {number} r Number of representative points
	 * @param {number} m Number of required sub-clusters
	 */
	constructor(r, m) {
		this._r = r
		this._m = m
		this._cutoff_scale = 3
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_mean(a) {
		const m = a[0].concat()
		for (let i = 1; i < a.length; i++) {
			for (let d = 0; d < m.length; d++) {
				m[d] += a[i][d]
			}
		}
		return m.map(v => v / a.length)
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} data Training data
	 */
	fit(data) {
		this._n = data.length
		let centers = data.map((v, i) => ({ v, i: [i] }))
		while (this._n > this._m && centers.length !== this._m) {
			const d = []
			for (let i = 0; i < centers.length; i++) {
				d[i] = []
				for (let j = 0; j < i; j++) {
					d[i][j] = d[j][i] = this._distance(centers[i].v, centers[j].v)
				}
			}

			const cp = []
			const cpd = []
			for (let i = 0; i < centers.length; i++) {
				cpd[i] = { i, d: Infinity }
				for (let j = 0; j < d[i].length; j++) {
					if (i !== j && d[i][j] < cpd[i].d) {
						cpd[i].d = d[i][j]
						cp[i] = j
					}
				}
			}
			cpd.sort((a, b) => b.d - a.d)

			let newCenters
			do {
				newCenters = []
				const unchecked = centers.map((_, i) => i)
				while (unchecked.length > 0) {
					const component = []
					const stack = [unchecked[0]]
					while (stack.length > 0) {
						const t = stack.pop()
						const tidx = unchecked.indexOf(t)
						if (tidx < 0) {
							continue
						}
						component.push(t)
						unchecked.splice(tidx, 1)
						if (cp[t] !== null) {
							stack.push(cp[t])
						}
						stack.push(...unchecked.filter(i => cp[i] === t))
					}
					if (component.length === 1) {
						newCenters.push(centers[component[0]])
						continue
					}

					const m = this._mean(component.map(v => centers[v].v))
					const idx = []
					if (this._cutoff_scale > 0) {
						const md = component.map(v => this._distance(m, centers[v].v))
						const mm = md.reduce((s, v) => s + v, 0) / component.length
						for (let k = 0; k < component.length; k++) {
							if (md[k] >= this._cutoff_scale * mm) {
								continue
							}
							for (let k = 0; k < component.length; k++) {
								idx.push(...centers[component[k]].i)
							}
						}
					} else {
						for (let k = 0; k < component.length; k++) {
							idx.push(...centers[component[k]].i)
						}
					}
					newCenters.push({ v: m, i: idx })
				}
				if (newCenters.length < this._m) {
					let c = newCenters.length
					for (let i = 0; i < cpd.length && c < this._m; i++) {
						if (cp[cpd[i].i] != null) {
							cp[cpd[i].i] = null
							c++
						}
					}
				}
			} while (newCenters.length < this._m)
			centers = newCenters
		}

		const clusters = []
		const distances = []
		for (let i = 0; i < centers.length; i++) {
			distances[i] = []
			distances[i][i] = 0
			for (let j = 0; j < i; j++) {
				distances[i][j] = distances[j][i] = this._distance(centers[i].v, centers[j].v)
			}
			clusters[i] = {
				repr: [centers[i].v],
				index: centers[i].i,
				distance: 0,
				children: [],
			}
		}

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

			const reprs = [...clusters[min_i].repr, ...clusters[min_j].repr]
			const m = this._mean(reprs)
			const reprsd = reprs.map((r, i) => [this._distance(r, m), i])
			reprsd.sort((a, b) => a[0] - b[0])
			const newReprs = reprsd.slice(0, this._r).map(v => reprs[v[1]])

			for (let i = 0; i < n; i++) {
				if (i === min_i || i === min_j) {
					distances[min_i][i] = 0
					continue
				}
				let md = Infinity
				for (let s = 0; s < clusters[i].repr.length; s++) {
					for (let t = 0; t < newReprs.length; t++) {
						const d = this._distance(clusters[i].repr[s], newReprs[t])
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
				repr: newReprs,
				index: [...clusters[min_i].index, ...clusters[min_j].index],
				distance: min_v,
				children: [clusters[min_i], clusters[min_j]],
			}
			clusters.splice(min_j, 1)
		}
		this._root = clusters[0]
	}

	/**
	 * Returns the specified number of clusters.
	 * @param {number} number Number of clusters
	 * @returns {{repr: number[][], index: number[], distance: number, children: *[]}[]} Cluster nodes
	 */
	getClusters(number) {
		const scanNodes = [this._root]
		while (scanNodes.length < number) {
			let max_distance = 0
			let max_distance_idx = -1
			for (let i = 0; i < scanNodes.length; i++) {
				const node = scanNodes[i]
				if (node.children.length > 0 && node.distance > max_distance) {
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
		const p = Array(this._n).fill(-1)
		const clusters = this.getClusters(k)
		for (let i = 0; i < clusters.length; i++) {
			const leafs = clusters[i].index
			for (let k = 0; k < leafs.length; k++) {
				p[leafs[k]] = i
			}
		}
		return p
	}
}
