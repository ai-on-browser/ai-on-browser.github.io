/**
 * mean-shift outlier detection (MOD)
 */
export default class MeanShiftOutlierDetection {
	// Mean-shift outlier detection
	// https://erepo.uef.fi/server/api/core/bitstreams/348d718e-8f07-4b9e-a31e-8ba1462ac6a3/content
	/**
	 * @param {number} [k] Number of neighborhoods
	 */
	constructor(k = 5) {
		this._k = k
	}

	_d(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns a list of the data predicted as outliers or not.
	 * @param {Array<Array<number>>} data Training data
	 * @returns {boolean[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const dim = data[0].length
		const repeat = 3
		let y = data
		for (let t = 0; t < repeat; t++) {
			const d = []
			for (let i = 0; i < n; i++) {
				d[i] = []
				d[i][i] = { i, d: 0 }
				for (let j = 0; j < i; j++) {
					const dij = this._d(y[i], y[j])
					d[i][j] = { i: j, v: dij }
					d[j][i] = { i, v: dij }
				}
			}
			const ny = []
			for (let i = 0; i < n; i++) {
				d[i].sort((a, b) => a.v - b.v)
				ny[i] = Array(dim).fill(0)
				for (let k = 0; k <= this._k; k++) {
					for (let j = 0; j < dim; j++) {
						ny[i][j] += y[d[i][k].i][j]
					}
				}
				ny[i] = ny[i].map(v => v / (this._k + 1))
			}
			y = ny
		}

		const d = []
		let m = 0
		let m2 = 0
		for (let i = 0; i < n; i++) {
			d[i] = 0
			for (let j = 0; j < dim; j++) {
				d[i] += Math.abs(data[i][j] - y[i][j])
			}
			m += d[i]
			m2 += d[i] ** 2
		}
		const sd = Math.sqrt(m2 / n - (m / n) ** 2)

		return d.map(v => v > sd)
	}
}
