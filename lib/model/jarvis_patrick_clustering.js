const metrics = {
	euclid: (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)),
	manhattan: (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0),
	chebyshev: (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i]))),
}

/**
 * Jarvis Patrick Clustering
 */
export default class JarvisPatrickClustering {
	// https://www.geeksforgeeks.org/machine-learning/basic-understanding-of-jarvis-patrick-clustering-algorithm/
	/**
	 * @param {number} k Number of neighborhoods
	 * @param {number} t Minimum number of shared neighbors
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | function (number[], number[]): number} [metric] Metric name
	 */
	constructor(k, t, metric = 'euclid') {
		this._k = k
		this._t = t

		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			this._d = metrics[this._metric]
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const d = Array(n)
		for (let i = 0; i < n; i++) {
			d[i] = []
			d[i][i] = { d: 0, i }
			for (let j = 0; j < i; j++) {
				const v = this._d(data[i], data[j])
				d[i][j] = { d: v, i: j }
				d[j][i] = { d: v, i }
			}
		}
		const nns = []
		for (let i = 0; i < n; i++) {
			d[i].sort((a, b) => a.d - b.d)
			nns[i] = new Set(d[i].slice(1, this._k + 1).map(v => v.i))
		}
		let c = 0
		const visited = Array(n).fill(false)
		const cluster = Array(n)

		const sharedNeighbor = (a, b) => {
			let c = 0
			for (const v of nns[a]) {
				if (nns[b].has(v)) {
					c++
				}
			}
			return c
		}

		for (let i = 0; i < n; i++) {
			if (visited[i]) continue
			const clst = c++
			const neighbors = [i]
			while (neighbors.length > 0) {
				const k = neighbors.pop()
				visited[k] = true
				cluster[k] = clst
				for (const j of nns[k]) {
					if (visited[j]) continue
					if (nns[j].has(k) && sharedNeighbor(k, j) >= this._t) {
						neighbors.push(j)
					}
				}
			}
		}
		return cluster
	}
}
