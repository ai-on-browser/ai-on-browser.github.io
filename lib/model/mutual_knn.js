/**
 * Mutual k-nearest-neighbor model
 */
export default class MutualKNN {
	// https://www.researchgate.net/profile/Edgar-Chavez-2/publication/23633245_Connectivity_of_the_mutual_k-nearest-neighbor_graph_in_clustering_and_outlier_detection/links/5aa3e8d2aca272d448b7b16c/Connectivity-of-the-mutual-k-nearest-neighbor-graph-in-clustering-and-outlier-detection.pdf
	/**
	 * @param {number} [k] Number of neighborhoods
	 */
	constructor(k = 5) {
		this._p = []
		this._k = k
	}

	/**
	 * Number of clusters
	 *
	 * @type {number}
	 */
	get size() {
		const y = this.predict()
		return new Set(y).size
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
		const dists = []
		for (let i = 0; i < n; i++) {
			dists[i] = []
			dists[i][i] = 0
			for (let j = 0; j < i; j++) {
				dists[i][j] = dists[j][i] = this._d(datas[i], datas[j])
			}
		}
		const cons = []
		for (let i = 0; i < n; i++) {
			const d = dists[i].map((v, k) => [v, k])
			d.sort((a, b) => a[0] - b[0])
			const nears = d.slice(1, this._k + 1)
			cons[i] = Array(n).fill(false)
			for (let k = 0; k < nears.length; k++) {
				cons[i][nears[k][1]] = true
			}
		}

		const mutg = []
		for (let i = 0; i < n; i++) {
			mutg[i] = Array(n).fill(false)
			for (let j = 0; j < i; j++) {
				if (cons[i][j] && cons[j][i]) {
					mutg[i][j] = mutg[j][i] = true
				}
			}
		}

		const verts = []
		for (let i = 0; i < n; i++) {
			verts.push(i)
		}
		const clusters = []
		let c = 0
		while (verts.length > 0) {
			const stack = [verts.shift()]
			while (stack.length > 0) {
				const i = stack.pop()
				clusters[i] = c
				for (let j = verts.length - 1; j >= 0; j--) {
					if (mutg[i][verts[j]]) {
						stack.push(verts[j])
						verts.splice(j, 1)
					}
				}
			}
			c++
		}

		this._c = clusters
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._c
	}
}
