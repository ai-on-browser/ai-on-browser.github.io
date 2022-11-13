/**
 * Robust Kernel-based Outlier Factor
 */
export default class RKOF {
	// RKOF: Robust Kernel-Based Local Outlier Detection
	// http://www.nlpr.ia.ac.cn/2011papers/gjhy/gh116.pdf
	/**
	 * @param {number} k Number of neighborhoods
	 * @param {number} h Smoothing parameter
	 * @param {number} alpha Sensitivity parameter
	 * @param {'gaussian' | 'epanechnikov' | 'volcano' | function (number[]): number} [kernel=gaussian] Kernel name
	 */
	constructor(k, h, alpha, kernel = 'gaussian') {
		this._k = k
		this._h = h
		this._alpha = alpha
		this._s = 1
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else if (kernel === 'gaussian') {
			this._kernel = x => Math.exp(-x.reduce((s, v) => s + v ** 2, 0) / 2) / Math.sqrt(2 * Math.PI) ** x.length
		} else if (kernel === 'epanechnikov') {
			this._kernel = x => {
				const s2 = x.reduce((s, v) => s + v ** 2, 0)
				return s2 > 1 ? 0 : (3 / 4) ** x.length * (1 - s2)
			}
		} else if (kernel === 'volcano') {
			this._beta = 1
			this._kernel = x => {
				const s2 = x.reduce((s, v) => s + v ** 2, 0)
				return s2 <= 1 ? this._beta : this._beta * Math.exp(-s2 + 1)
			}
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

		const kdist = []
		let logg = 0
		for (let i = 0; i < n; i++) {
			d[i].sort((a, b) => a.d - b.d)
			kdist[i] = d[i][this._k + 1].d
			logg += Math.log(1 / kdist[i])
		}
		logg /= n
		const g = Math.exp(logg)
		const C = this._h * g ** this._alpha

		const kde = []
		const mink = []
		for (let i = 0; i < n; i++) {
			kde[i] = 0
			mink[i] = Infinity
			for (let k = 1; k <= this._k; k++) {
				const dv = C * kdist[d[i][k].i] ** this._alpha
				const x = datas[d[i][k].i].map((v, d) => (datas[i][d] - v) / dv)
				kde[i] += this._kernel(x) / dv ** 2
				mink[i] = Math.min(mink[i], kdist[d[i][k].i])
			}
			kde[i] /= this._k
		}

		const wde = []
		for (let i = 0; i < n; i++) {
			wde[i] = 0
			let ws = 0
			for (let k = 1; k <= this._k; k++) {
				const w = Math.exp(-((kdist[d[i][k].i] / mink[i] - 1) ** 2) / (2 * this._s ** 2))
				wde[i] += w * kde[d[i][k].i]
				ws += w
			}
			wde[i] /= ws
		}

		const rkof = []
		for (let i = 0; i < n; i++) {
			if (kde[i] === 0) {
				rkof[i] = Infinity
			} else {
				rkof[i] = wde[i] / kde[i]
			}
		}
		return rkof
	}
}
