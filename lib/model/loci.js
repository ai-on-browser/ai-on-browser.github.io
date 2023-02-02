/**
 * Local Correlation Integral
 */
export default class LOCI {
	// LOCI: Fast Outlier Detection Using the Local Correlation Integral
	// https://apps.dtic.mil/sti/pdfs/ADA461085.pdf
	/**
	 * @param {number} [alpha=0.5] Alpha
	 */
	constructor(alpha = 0.5) {
		this._alpha = alpha
		this._rmax = Infinity
		this._nmin = 20
		this._ks = 3
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns a list of the data predicted as outliers or not.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {boolean[]} Predicted values
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
		for (let i = 0; i < n; i++) {
			distances[i].sort((a, b) => a.d - b.d)
		}

		const outliers = Array(n).fill(false)
		for (let i = 0; i < n; i++) {
			const cd = distances[i].filter(v => v.d <= this._rmax)

			for (let m = Math.min(this._nmin, Math.floor(cd.length / 2)); m < cd.length; m++) {
				const r = cd[m].d
				const npir = m + 1
				const npar = []
				for (let p = 0; p <= m; p++) {
					npar[p] = 0
					const ar = this._alpha * r
					let h = n
					let l = 0
					while (l < h) {
						const c = Math.floor((h + l) / 2)
						if (distances[cd[p].i][c].d <= ar) {
							l = c + 1
						} else {
							h = c
						}
					}
					npar[p] = l
				}
				const nhpira = npar.reduce((s, v) => s + v, 0) / npir
				const snhpira = Math.sqrt(npar.reduce((s, v) => s + (v - nhpira) ** 2, 0) / npir)

				const mdef = 1 - npar[0] / nhpira
				const smdef = snhpira / nhpira

				if (mdef > this._ks * smdef) {
					outliers[i] = true
					break
				}
			}
		}
		return outliers
	}
}
