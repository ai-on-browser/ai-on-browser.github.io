export default class DBSCAN {
	// https://ja.wikipedia.org/wiki/DBSCAN
	constructor(eps = 0.5, minPts = 5, metric = 'euclid') {
		this._eps = eps
		this._minPts = minPts

		this._metric = metric
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

	predict(datas) {
		let c = 0
		const n = datas.length
		const visited = Array(n).fill(false)
		const cluster = Array(n)
		const d = Array(n)
		for (let i = 0; i < n; d[i++] = Array(n));
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				const v = this._d(datas[i], datas[j])
				d[i][j] = d[j][i] = v
			}
		}
		const getNeighbors = i => {
			const neighbors = []
			for (let k = 0; k < n; k++) {
				if (d[i][k] < this._eps) neighbors.push(k)
			}
			return neighbors
		}
		for (let i = 0; i < n; i++) {
			if (visited[i]) continue
			visited[i] = true
			const neighbors = getNeighbors(i)
			if (neighbors.length < this._minPts) {
				cluster[i] = -1
				continue
			}
			const clst = c++
			cluster[i] = clst
			while (neighbors.length > 0) {
				const k = neighbors.pop()
				if (!visited[k]) {
					visited[k] = true
					const ns = getNeighbors(k)
					if (ns.length >= this._minPts) {
						neighbors.push(...ns)
					}
				}
				if (!cluster[k]) cluster[k] = clst
			}
		}
		return cluster
	}
}
