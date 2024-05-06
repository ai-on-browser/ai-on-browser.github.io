/**
 * Relative Density Factor
 */
export default class RDF {
	// Progress in Outlier Detection Techniques: A Survey
	// https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=8786096
	// RDF: a density-based outlier detection method using vertical data representation
	/**
	 * @param {number} [r] Radius
	 */
	constructor(r = 1.0) {
		this._r = r
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length
		const distances = []
		for (let i = 0; i < n; i++) {
			distances[i] = []
			distances[i][i] = { d: 0, i }
			for (let j = 0; j < i; j++) {
				const d = this._distance(datas[i], datas[j])
				distances[i][j] = { d, i: j }
				distances[j][i] = { d, i }
			}
		}

		const nbrs = []
		for (let i = 0; i < n; i++) {
			distances[i].sort((a, b) => a.d - b.d)
			nbrs[i] = 0
			for (let j = 0; j < n; j++) {
				if (distances[i][j].d < this._r) {
					nbrs[i]++
				}
			}
		}

		const rdf = []
		for (let i = 0; i < n; i++) {
			rdf[i] = 0
			for (let j = 0; j < n; j++) {
				if (distances[i][j].d < this._r) {
					rdf[i] += nbrs[distances[i][j].i]
				}
			}
			rdf[i] /= nbrs[i] ** 2
		}
		return rdf
	}
}
