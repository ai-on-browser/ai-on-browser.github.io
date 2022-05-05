/**
 * Local Density Factor
 */
export default class LDF {
	// Outlier Detection with Kernel Density Functions
	// https://cis.temple.edu/~latecki/Papers/mldm07.pdf
	/**
	 * @param {number} [k] Number of neighborhoods
	 */
	constructor(k) {
		this._k = k
		this._m = k
		this._h = 1
		this._c = 0.1
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
		for (let i = 0; i < n; i++) {
			d[i].sort((a, b) => a.d - b.d)
		}

		const lde = []
		const dim = datas[0].length
		const nf = (2 * Math.PI) ** (dim / 2)
		for (let i = 0; i < n; i++) {
			let ld = 0
			for (let j = 0; j < this._m; j++) {
				const dx = d[d[i][j + 1].i][this._k].d
				const rd = Math.max(d[i][j + 1].d, dx)
				const hdx = this._h * dx
				ld += Math.exp(-(rd ** 2) / (2 * hdx ** 2)) / (nf * hdx ** dim)
			}
			lde[i] = ld / this._m
		}
		const ldf = []
		for (let i = 0; i < n; i++) {
			let s = 0
			for (let j = 0; j < this._m; j++) {
				s += lde[d[i][j + 1].i]
			}
			s /= this._m
			ldf[i] = s / (lde[i] + this._c * s)
		}
		return ldf
	}
}
