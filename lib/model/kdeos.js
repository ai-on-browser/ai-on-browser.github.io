/**
 * Kernel Density Estimation Outlier Score
 */
export default class KDEOS {
	// Generalized Outlier Detection with Flexible Kernel Density Estimates
	// https://epubs.siam.org/doi/pdf/10.1137/1.9781611973440.63
	/**
	 * @param {number} kmin Minimum number of neighborhoods
	 * @param {number} kmax Maximum number of neighborhoods
	 * @param {'gaussian' | 'epanechnikov' | { name: 'gaussian' } | { name: 'epanechnikov' } | function (number, number, number): number} [kernel] Kernel name
	 */
	constructor(kmin, kmax, kernel = 'gaussian') {
		this._kmin = kmin
		this._kmax = kmax
		this._e = Infinity
		this._phi = 0.1
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			if (kernel.name === 'gaussian') {
				this._kernel = (u, h, d) => Math.exp(-(u ** 2) / (2 * h ** 2)) / (h * Math.sqrt(2 * Math.PI)) ** d
			} else {
				this._kernel = (u, h, d) => (3 * (1 - (u / h) ** 2)) / (4 * h ** d)
			}
		}
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_cdf(x) {
		return 1 / (1 + Math.exp(-1.7 * x))
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

		const S = []
		const dim = datas[0].length
		for (let i = 0; i < n; i++) {
			S[i] = []
			for (let k = this._kmin; k <= this._kmax; k++) {
				let md = 0
				for (let t = 0; t < k; t++) {
					md += d[i][t + 1].d
				}
				const h = Math.min(md / k, this._e)
				S[i][k] = 0
				for (let t = 0; t < k; t++) {
					S[i][k] += this._kernel(d[i][t + 1].d, h, dim)
				}
			}
		}
		const s = []
		for (let i = 0; i < n; i++) {
			s[i] = 0
			for (let k = this._kmin; k <= this._kmax; k++) {
				let m = 0
				for (let t = 0; t < k; t++) {
					m += S[d[i][t + 1].i][k]
				}
				m /= k
				let std = 0
				for (let t = 0; t < k; t++) {
					std += (S[d[i][t + 1].i][k] - m) ** 2
				}
				std = Math.sqrt(std / k)
				s[i] += (m - S[i][k]) / std
			}
			s[i] /= this._kmax - this._kmin + 1
		}
		for (let i = 0; i < n; i++) {
			s[i] = 1 - this._cdf(s[i])
			s[i] = (this._phi * (1 - s[i])) / (this._phi + s[i])
		}
		return s
	}
}
