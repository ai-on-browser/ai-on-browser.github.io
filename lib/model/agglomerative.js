import Tree from '../util/tree.js'

/**
 * Agglomerative clustering
 */
class AgglomerativeClustering {
	/**
	 * @param {'euclid' | 'manhattan' | 'chebyshev'} metric Metric name
	 */
	constructor(metric = 'euclid') {
		this._root = null
		this._metric = metric

		switch (this._metric) {
			case 'euclid':
				this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
				break
			case 'manhattan':
				this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
				break
			case 'chebyshev':
				this._d = (a, b) => a.reduce((s, v, i) => Math.max(s, Math.abs(v - b[i])), -Infinity)
				break
		}
	}

	/**
	 * Fit model parameters.
	 *
	 * @param {Array<Array<number>>} points Training data
	 */
	fit(points) {
		const clusters = []
		points.forEach((v, i) => {
			clusters.push(
				new Tree({
					point: v,
					index: i,
					distances: points.map(p => this._d(v, p)),
				})
			)
		})

		const distances = []
		for (let i = 0; i < clusters.length; i++) {
			if (!distances[i]) distances[i] = []
			for (let j = 0; j < i; j++) {
				if (!distances[i][j]) distances[i][j] = distances[j][i] = this.distance(clusters[i], clusters[j])
			}
		}
		while (clusters.length > 1) {
			let n = clusters.length

			let min_i = 0
			let min_j = 1
			let min_d = distances[0][1]
			for (let i = 1; i < n; i++) {
				distances[i].forEach((d, j) => {
					if (d < min_d) {
						min_i = i
						min_j = j
						min_d = d
					}
				})
			}
			let min_i_leafs = clusters[min_i].leafCount()
			let min_j_leafs = clusters[min_j].leafCount()
			distances.forEach((dr, k) => {
				if (k != min_j && k != min_i) {
					dr[min_i] = this.update(
						min_i_leafs,
						min_j_leafs,
						clusters[k].leafCount(),
						dr[min_i],
						dr[min_j],
						distances[min_j][min_i]
					)
					distances[min_i][k] = dr[min_i]
					dr.splice(min_j, 1)
				}
			})
			distances[min_i].splice(min_j, 1)
			distances.splice(min_j, 1)
			clusters[min_i] = new Tree(
				{
					distance: min_d,
				},
				[clusters[min_i], clusters[min_j]]
			)
			clusters.splice(min_j, 1)
		}
		this._root = clusters[0]
	}

	/**
	 * Returns the specified number of clusters.
	 *
	 * @param {number} number Number of clusters
	 * @returns {Tree[]} Cluster nodes
	 */
	getClusters(number) {
		const scanNodes = [this._root]
		while (scanNodes.length < number) {
			let max_distance = 0
			let max_distance_idx = -1
			for (let i = 0; i < scanNodes.length; i++) {
				const node = scanNodes[i]
				if (!node.isLeaf() && node.value.distance > max_distance) {
					max_distance_idx = i
					max_distance = node.value.distance
				}
			}
			if (max_distance_idx === -1) {
				break
			}
			const max_distance_node = scanNodes[max_distance_idx]
			scanNodes.splice(max_distance_idx, 1, max_distance_node.at(0), max_distance_node.at(1))
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
		const p = []
		const clusters = this.getClusters(k)
		for (let i = 0; i < clusters.length; i++) {
			const leafs = clusters[i].leafValues()
			for (let k = 0; k < leafs.length; k++) {
				p[leafs[k].index] = i
			}
		}
		return p
	}

	/**
	 * Returns a distance between two nodes.
	 *
	 * @abstract
	 * @param {Tree} c1 Node
	 * @param {Tree} c2 Node
	 * @returns {number} Distance
	 */
	distance(c1, c2) {
		throw new Error('Not Implemented')
	}

	_mean(d) {
		const m = Array(d[0].length).fill(0)
		for (let i = 0; i < d.length; i++) {
			for (let k = 0; k < d[i].length; k++) {
				m[k] += d[i][k]
			}
		}
		return m.map(v => v / d.length)
	}

	_lanceWilliamsUpdater(ala, alb, bt, gm) {
		return (ka, kb, ab) => ala * ka + alb * kb + bt * ab + gm * Math.abs(ka - kb)
	}

	/**
	 * Returns new distance.
	 *
	 * @abstract
	 * @param {number} ca Number of datas in a merging node A
	 * @param {number} cb Number of datas in a merging node B
	 * @param {number} ck Number of datas in a current node
	 * @param {number} ka Distance between node A and current node
	 * @param {number} kb Distance between node B and current node
	 * @param {number} ab Distance between node A and node B
	 * @returns {number} New distance between current node and merged node
	 */
	update(ca, cb, ck, ka, kb, ab) {
		throw new Error('Not Implemented')
	}
}

/**
 * Complete linkage agglomerative clustering
 */
export class CompleteLinkageAgglomerativeClustering extends AgglomerativeClustering {
	/**
	 * Returns a distance between two nodes.
	 *
	 * @param {Tree} c1 Node
	 * @param {Tree} c2 Node
	 * @returns {number} Distance
	 */
	distance(c1, c2) {
		let f1 = c1.leafValues()
		let f2 = c2.leafValues()
		return Math.max.apply(
			null,
			f1.map(v1 => {
				return Math.max.apply(
					null,
					f2.map(v2 => v1.distances[v2.index])
				)
			})
		)
	}

	/**
	 * Returns new distance.
	 *
	 * @param {number} ca Number of datas in a merging node A
	 * @param {number} cb Number of datas in a merging node B
	 * @param {number} ck Number of datas in a current node
	 * @param {number} ka Distance between node A and current node
	 * @param {number} kb Distance between node B and current node
	 * @param {number} ab Distance between node A and node B
	 * @returns {number} New distance between current node and merged node
	 */
	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(0.5, 0.5, 0, 0.5)(ka, kb, ab)
	}
}

/**
 * Single linkage agglomerative clustering
 */
export class SingleLinkageAgglomerativeClustering extends AgglomerativeClustering {
	/**
	 * Returns a distance between two nodes.
	 *
	 * @param {Tree} c1 Node
	 * @param {Tree} c2 Node
	 * @returns {number} Distance
	 */
	distance(c1, c2) {
		let f1 = c1.leafValues()
		let f2 = c2.leafValues()
		let minDistance = Math.min.apply(
			null,
			f1.map(v1 => {
				return Math.min.apply(
					null,
					f2.map(v2 => v1.distances[v2.index])
				)
			})
		)
		return minDistance
	}

	/**
	 * Returns new distance.
	 *
	 * @param {number} ca Number of datas in a merging node A
	 * @param {number} cb Number of datas in a merging node B
	 * @param {number} ck Number of datas in a current node
	 * @param {number} ka Distance between node A and current node
	 * @param {number} kb Distance between node B and current node
	 * @param {number} ab Distance between node A and node B
	 * @returns {number} New distance between current node and merged node
	 */
	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(0.5, 0.5, 0, -0.5)(ka, kb, ab)
	}
}

/**
 * Group average agglomerative clustering
 */
export class GroupAverageAgglomerativeClustering extends AgglomerativeClustering {
	/**
	 * Returns a distance between two nodes.
	 *
	 * @param {Tree} c1 Node
	 * @param {Tree} c2 Node
	 * @returns {number} Distance
	 */
	distance(c1, c2) {
		let f1 = c1.leafValues()
		let f2 = c2.leafValues()
		let totalDistance = f1.reduce((acc1, v1) => {
			return acc1 + f2.reduce((acc2, v2) => acc2 + v1.distances[v2.index], 0)
		}, 0)
		return totalDistance / (f1.length * f2.length)
	}

	/**
	 * Returns new distance.
	 *
	 * @param {number} ca Number of datas in a merging node A
	 * @param {number} cb Number of datas in a merging node B
	 * @param {number} ck Number of datas in a current node
	 * @param {number} ka Distance between node A and current node
	 * @param {number} kb Distance between node B and current node
	 * @param {number} ab Distance between node A and node B
	 * @returns {number} New distance between current node and merged node
	 */
	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(ca / (ca + cb), cb / (ca + cb), 0, 0)(ka, kb, ab)
	}
}

/**
 * Ward's agglomerative clustering
 */
export class WardsAgglomerativeClustering extends AgglomerativeClustering {
	/**
	 * Returns a distance between two nodes.
	 *
	 * @param {Tree} c1 Node
	 * @param {Tree} c2 Node
	 * @returns {number} Distance
	 */
	distance(c1, c2) {
		let f1 = c1.leafValues().map(f => f.point)
		let f2 = c2.leafValues().map(f => f.point)
		let fs = f1.concat(f2)
		let ave1 = this._mean(f1)
		let ave2 = this._mean(f2)
		let aves = this._mean(fs)
		let e1 = f1.reduce((acc, f) => acc + this._d(f, ave1) ** 2, 0)
		let e2 = f2.reduce((acc, f) => acc + this._d(f, ave2) ** 2, 0)
		let es = fs.reduce((acc, f) => acc + this._d(f, aves) ** 2, 0)
		return es - e1 - e2
	}

	/**
	 * Returns new distance.
	 *
	 * @param {number} ca Number of datas in a merging node A
	 * @param {number} cb Number of datas in a merging node B
	 * @param {number} ck Number of datas in a current node
	 * @param {number} ka Distance between node A and current node
	 * @param {number} kb Distance between node B and current node
	 * @param {number} ab Distance between node A and node B
	 * @returns {number} New distance between current node and merged node
	 */
	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(
			(ck + ca) / (ck + ca + cb),
			(ck + cb) / (ck + ca + cb),
			-ck / (ck + ca + cb),
			0
		)(ka, kb, ab)
	}
}

/**
 * Centroid agglomerative clustering
 */
export class CentroidAgglomerativeClustering extends AgglomerativeClustering {
	/**
	 * Returns a distance between two nodes.
	 *
	 * @param {Tree} c1 Node
	 * @param {Tree} c2 Node
	 * @returns {number} Distance
	 */
	distance(c1, c2) {
		let f1 = c1.leafValues().map(f => f.point)
		let f2 = c2.leafValues().map(f => f.point)
		let d = this._d(this._mean(f1), this._mean(f2))
		return d * d
	}

	/**
	 * Returns new distance.
	 *
	 * @param {number} ca Number of datas in a merging node A
	 * @param {number} cb Number of datas in a merging node B
	 * @param {number} ck Number of datas in a current node
	 * @param {number} ka Distance between node A and current node
	 * @param {number} kb Distance between node B and current node
	 * @param {number} ab Distance between node A and node B
	 * @returns {number} New distance between current node and merged node
	 */
	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(
			ca / (ca + cb),
			cb / (ca + cb),
			(-ca * cb) / ((ca + cb) * (ca + cb)),
			0
		)(ka, kb, ab)
	}
}

/**
 * Weighted average agglomerative clustering
 */
export class WeightedAverageAgglomerativeClustering extends AgglomerativeClustering {
	/**
	 * Returns a distance between two nodes.
	 *
	 * @param {Tree} c1 Node
	 * @param {Tree} c2 Node
	 * @returns {number} Distance
	 */
	distance(c1, c2) {
		let calcDistRec = function calcDistRec(h1, h2) {
			if (h1.leafCount() === 1 && h2.leafCount() === 1) {
				return h1.value.distances[h2.value.index]
			} else if (h2.leafCount() === 1) {
				return (calcDistRec(h2, h1.at(0)) + calcDistRec(h2, h1.at(1))) / 2
			} else {
				return (calcDistRec(h1, h2.at(0)) + calcDistRec(h1, h2.at(1))) / 2
			}
		}
		return calcDistRec(c1, c2)
	}

	/**
	 * Returns new distance.
	 *
	 * @param {number} ca Number of datas in a merging node A
	 * @param {number} cb Number of datas in a merging node B
	 * @param {number} ck Number of datas in a current node
	 * @param {number} ka Distance between node A and current node
	 * @param {number} kb Distance between node B and current node
	 * @param {number} ab Distance between node A and node B
	 * @returns {number} New distance between current node and merged node
	 */
	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(0.5, 0.5, 0, 0)(ka, kb, ab)
	}
}

/**
 * Median agglomerative clustering
 */
export class MedianAgglomerativeClustering extends AgglomerativeClustering {
	/**
	 * Returns a distance between two nodes.
	 *
	 * @param {Tree} c1 Node
	 * @param {Tree} c2 Node
	 * @returns {number} Distance
	 */
	distance(c1, c2) {
		let m1 = this._mean(c1.leafValues().map(f => f.point))
		let m2 = this._mean(c2.leafValues().map(f => f.point))
		let m = m1.map((v, i) => (v + m2[i]) / 2)
		return this._d(m, m2) ** 2
	}

	/**
	 * Returns new distance.
	 *
	 * @param {number} ca Number of datas in a merging node A
	 * @param {number} cb Number of datas in a merging node B
	 * @param {number} ck Number of datas in a current node
	 * @param {number} ka Distance between node A and current node
	 * @param {number} kb Distance between node B and current node
	 * @param {number} ab Distance between node A and node B
	 * @returns {number} New distance between current node and merged node
	 */
	update(ca, cb, ck, ka, kb, ab) {
		return this._lanceWilliamsUpdater(0.5, 0.5, -0.25, 0)(ka, kb, ab)
	}
}
