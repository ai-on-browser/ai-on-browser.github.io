/**
 * Influenced Outlierness
 */
export default class INFLO {
	// http://ethesis.nitrkl.ac.in/5130/1/109CS0195.pdf
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
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length
		const distances = []
		const is = []
		for (let i = 0; i < n; i++) {
			distances[i] = []
			distances[i][i] = { d: 0, i }
			for (let j = 0; j < i; j++) {
				const d = this._distance(datas[i], datas[j])
				distances[i][j] = { d, i: j }
				distances[j][i] = { d, i }
			}
			is[i] = new Set()
		}
		const den = []
		for (let i = 0; i < n; i++) {
			distances[i].sort((a, b) => a.d - b.d)
			for (let k = 1; k < this._k + 1; k++) {
				is[i].add(distances[i][k].i)
				is[distances[i][k].i].add(i)
			}
			den[i] = 1 / distances[i][this._k].d
		}

		const inflo = []
		for (let i = 0; i < n; i++) {
			inflo[i] = 0
			for (const k of is[i]) {
				inflo[i] += den[k]
			}
			inflo[i] /= is[i].size * den[i]
		}
		return inflo
	}
}
