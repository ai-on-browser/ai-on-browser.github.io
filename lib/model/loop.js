/**
 * Local Outlier Probability
 */
export default class LoOP {
	// https://github.com/vc1492a/PyNomaly
	// https://www.dbs.ifi.lmu.de/Publikationen/Papers/LoOP1649.pdf
	/**
	 * @param {number} k Number of neighborhoods
	 */
	constructor(k) {
		this._k = k
		this._lambda = 1
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_erf(z) {
		const p = 0.3275911
		const a1 = 0.254829592
		const a2 = -0.284496736
		const a3 = 1.421413741
		const a4 = -1.453152027
		const a5 = 1.061405429

		const sign = z < 0 ? -1 : 1
		const t = 1 / (1 + p * Math.abs(z))
		const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z)
		return sign * erf
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length
		const distances = []
		for (let i = 0; i < n; i++) {
			distances[i] = []
			distances[i][i] = 0
			for (let j = 0; j < i; j++) {
				const d = this._distance(datas[i], datas[j])
				distances[i][j] = distances[j][i] = d
			}
		}
		const pdist = []
		const nears = []
		for (let i = 0; i < n; i++) {
			const sdist = distances[i].map((v, k) => [v, k])
			sdist.sort((a, b) => a[0] - b[0])
			const nrest = sdist.slice(1, this._k + 1).map(v => v[1])
			nears[i] = nrest.concat()

			const sd = nears[i].reduce((s, v) => s + distances[i][v] ** 2, 0)
			pdist[i] = this._lambda * Math.sqrt(sd / nears[i].length)
		}
		const plof = []
		for (let i = 0; i < n; i++) {
			const epdist = nears[i].reduce((s, v) => s + pdist[v], 0) / nears[i].length
			plof[i] = pdist[i] / epdist - 1
		}
		const nplof = this._lambda + Math.sqrt(plof.reduce((s, v) => s + v ** 2, 0) / n)
		const nplof2 = nplof * Math.sqrt(2)

		const loop = []
		for (let i = 0; i < n; i++) {
			loop[i] = Math.max(0, this._erf(plof[i] / nplof2))
		}
		return loop
	}
}
