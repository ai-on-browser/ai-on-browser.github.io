/**
 * Cluster-Based Local Outlier Factor
 */
export default class CBLOF {
	// Discovering Cluster Based Local Outliers
	// https://www.diag.uniroma1.it/~sassano/STAGE/Outliers.pdf
	/**
	 * @param {number} alpha Percentage of data points at least contains large cluster
	 * @param {number} beta Data size multiplier for large cluster relative to small cluster
	 * @param {function (Array<Array<*>>): number[]} clustering Clustering method
	 * @param {'min' | function (*[], Array<Array<*>>): number} distance Calculate data and cluster
	 */
	constructor(alpha, beta, clustering, distance = 'min') {
		this._alpha = alpha
		this._beta = beta
		this._clust = clustering
		if (typeof distance === 'function') {
			this._d = distance
		} else {
			this._d = (v, clst) => {
				let min_d = Infinity
				for (let i = 0; i < clst.length; i++) {
					const d = v.reduce((s, a, j) => s + (a - clst[i][j]) ** 2, 0)
					min_d = Math.min(min_d, d)
				}
				return min_d
			}
		}
	}

	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<*>>} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const c = this._clust(data)
		const cs = []
		for (let i = 0; i < n; i++) {
			if (!cs[c[i]]) {
				cs[c[i]] = { k: c[i], n: 0, v: [] }
			}
			cs[c[i]].n++
			cs[c[i]].v.push(data[i])
		}
		cs.sort((a, b) => b.n - a.n)
		const cidx = cs.map(cl => cl.k)
		let total = 0
		let b = 0
		for (; b < cs.length - 1; b++) {
			total += cs[b].n
			if (total >= n * this._alpha && cs[b].n / cs[b + 1].n >= this._beta) {
				break
			}
		}
		const cblof = []
		for (let i = 0; i < n; i++) {
			const ki = cidx.indexOf(c[i])
			if (ki > b) {
				let min_d = Infinity
				for (let k = 0; k <= b; k++) {
					const d = this._d(data[i], cs[k].v)
					min_d = Math.min(min_d, d)
				}
				cblof[i] = cs[ki].n * min_d
			} else {
				cblof[i] = cs[ki].n * this._d(data[i], cs[ki].v)
			}
		}
		return cblof
	}
}
