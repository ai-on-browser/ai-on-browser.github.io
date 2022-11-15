/**
 * Relative Density-based Outlier Score
 */
export default class RDOS {
	// Generalized Outlier Detection with Flexible Kernel Density Estimates
	// https://my.ece.msstate.edu/faculty/tang/PDFfiles/RDOS.pdf
	/**
	 * @param {number} k Number of neighborhoods
	 * @param {number} h Kernel width
	 * @param {'gaussian' | function (number[]): number} [kernel=gaussian] Kernel name
	 */
	constructor(k, h, kernel = 'gaussian') {
		this._k = k
		this._h = h
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else if (kernel === 'gaussian') {
			this._kernel = x => Math.exp(-x.reduce((s, v) => s + v ** 2, 0) / 2) / Math.sqrt(2 * Math.PI) ** x.length
		}
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
		const n = datas.length
		const d = []
		for (let i = 0; i < n; i++) {
			d[i] = []
			d[i][i] = { d: 0, i }
			for (let j = 0; j < i; j++) {
				const dist = this._distance(datas[i], datas[j])
				d[i][j] = { d: dist, i: j }
				d[j][i] = { d: dist, i }
			}
		}

		const knn = []
		for (let i = 0; i < n; i++) {
			d[i].sort((a, b) => a.d - b.d)
			knn[i] = d[i].slice(1, this._k + 1).map(v => v.i)
		}
		const rnn = []
		for (let i = 0; i < n; i++) {
			rnn[i] = []
			for (let j = 0; j < n; j++) {
				if (knn[j].some(v => v === i)) {
					rnn[i].push(j)
				}
			}
		}

		const p = []
		const s = []
		for (let i = 0; i < n; i++) {
			const snn = new Set()
			for (let k = 0; k < this._k; k++) {
				for (const j of rnn[knn[i][k]]) {
					if (j !== i) {
						snn.add(j)
					}
				}
			}
			s[i] = new Set([...knn[i], ...rnn[i], ...snn])
			p[i] = this._kernel(Array(datas[i].length).fill(0))
			for (const j of s[i]) {
				const x = datas[i].map((v, d) => (v - datas[j][d]) / this._h)
				p[i] += this._kernel(x)
			}
			p[i] /= this._h ** datas[i].length * (s[i].size + 1)
		}

		const rdos = []
		for (let i = 0; i < n; i++) {
			let r = 0
			for (const j of s[i]) {
				r += p[j]
			}
			rdos[i] = r / (s[i].size * p[i])
		}
		return rdos
	}
}
