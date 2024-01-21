/**
 * Natural Outlier Factor
 */
export default class NOF {
	// Huang, J., Zhu, Q., Yang, L. & Feng, J. (2015). A non-parameter outlier detection algorithm based on Natural Neighbor. Knowledge-Based Systems. pp. 71-77. DOI: 10.1016/j.knosys.2015.10.014
	// https://rdrr.io/cran/DDoutlier/man/NOF.html
	// https://jp.mathworks.com/matlabcentral/fileexchange/72244-density-based-outlier-detection-algorithms
	/**
	 * @param {number} [k] Number of neighborhoods
	 */
	constructor(k = 0) {
		this._k = k
	}

	_d(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length

		const dist = []
		for (let i = 0; i < n; i++) {
			dist[i] = []
			dist[i][i] = Infinity
			for (let j = 0; j < i; j++) {
				dist[i][j] = dist[j][i] = this._d(datas[i], datas[j])
			}
		}
		for (let i = 0; i < n; i++) {
			dist[i] = dist[i].map((d, j) => ({ d, i: j }))
			dist[i].sort((a, b) => a.d - b.d)
		}

		if (!this._k) {
			let inn = new Set()
			for (this._k = 1; this._k < n; this._k++) {
				const newinn = new Set(inn)
				for (let i = 0; i < n; i++) {
					newinn.add(dist[i][this._k - 1].i)
				}
				if (inn.size === newinn.size) {
					break
				}
				inn = newinn
			}
		}

		const ldr = []
		for (let i = 0; i < n; i++) {
			ldr[i] = 0
			for (let k = 0; k < this._k; k++) {
				const rd = Math.max(dist[i][k].d, dist[dist[i][k].i][this._k].d)
				ldr[i] += rd
			}
			ldr[i] = this._k / ldr[i]
		}

		const nof = []
		for (let i = 0; i < n; i++) {
			const nis = new Set(dist[i].slice(0, this._k).map(v => v.i))
			for (let j = 0; j < n; j++) {
				for (let k = 0; k < this._k; k++) {
					if (dist[j][k].i === i) {
						nis.add(j)
					}
				}
			}
			let lrdos = 0
			for (const j of nis) {
				lrdos += ldr[j]
			}
			nof[i] = lrdos / nis.size / ldr[i]
		}
		return nof
	}
}
