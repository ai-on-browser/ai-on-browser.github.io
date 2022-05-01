/**
 * Local Distance-based Outlier Factor
 */
export default class LDOF {
	// https://arxiv.org/abs/0903.3257
	/**
	 * @param {number} k Number of neighborhoods
	 */
	constructor(k) {
		this._k = k
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const distances = []
		for (let i = 0; i < datas.length; i++) {
			distances[i] = []
			distances[i][i] = 0
			for (let j = 0; j < i; j++) {
				const d = this._distance(datas[i], datas[j])
				distances[i][j] = distances[j][i] = d
			}
		}

		const ldof = []
		const mk = Math.min(this._k + 1, datas.length)
		for (let i = 0; i < datas.length; i++) {
			const sdist = distances[i].map((v, k) => [v, k])
			sdist.sort((a, b) => a[0] - b[0])
			let d = 0
			let sumd = 0
			for (let k = 1; k < mk; k++) {
				d += sdist[k][0]
				for (let t = 1; t < mk; t++) {
					if (k !== t) {
						sumd += distances[sdist[k][1]][sdist[t][1]]
					}
				}
			}
			const dx = d / (mk - 1)
			const Dx = sumd / ((mk - 1) * (mk - 2))
			ldof[i] = dx / Dx
		}
		return ldof
	}
}
