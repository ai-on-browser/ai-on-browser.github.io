/**
 * Angle-based Outlier Detection
 */
export default class ABOD {
	// Angle-Based Outlier Detection in High-dimensional Data
	// https://www.dbs.ifi.lmu.de/~zimek/publications/KDD2008/KDD08-ABOD.pdf
	/**
	 * @param {number} [k] Number of neighborhoods
	 */
	constructor(k = Infinity) {
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

		const abof = []
		for (let i = 0; i < n; i++) {
			const d = []
			const norm = []
			for (let j = 1; j < n && j <= this._k; j++) {
				const t = distances[i][j].i
				const dj = datas[i].map((v, k) => datas[t][k] - v)
				d.push(dj)
				norm.push(Math.sqrt(dj.reduce((s, v) => s + v ** 2, 0)))
			}
			let num1 = 0
			let num2 = 0
			let sum = 0
			for (let s = 0; s < d.length; s++) {
				for (let t = 0; t < d.length; t++) {
					if (s === t) {
						continue
					}
					const sp = d[s].reduce((s, v, k) => s + v * d[t][k], 0)
					const den = norm[s] * norm[t]
					const num = sp / den ** 3
					num1 += num ** 2
					num2 += num
					sum += 1 / den
				}
			}
			abof[i] = num1 / sum - (num2 / sum) ** 2
		}
		return abof
	}
}

/**
 * Lower-bound for the Angle-based Outlier Detection
 */
export class LBABOD {
	// Angle-Based Outlier Detection in High-dimensional Data
	// https://www.dbs.ifi.lmu.de/~zimek/publications/KDD2008/KDD08-ABOD.pdf
	/**
	 * @param {number} [k] Number of neighborhoods
	 * @param {number} [l] Number of outliers
	 */
	constructor(k = 10, l = 5) {
		this._k = k
		this._l = l
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns a list of the data predicted as outliers or not.
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {boolean[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length
		const distances = []
		const norms = []
		const diffs = []
		for (let i = 0; i < n; i++) {
			distances[i] = []
			distances[i][i] = { d: 0, i }
			for (let j = 0; j < i; j++) {
				const d = this._distance(datas[i], datas[j])
				distances[i][j] = { d, i: j }
				distances[j][i] = { d, i }
			}

			norms[i] = []
			diffs[i] = []
			for (let j = 0; j < n; j++) {
				diffs[i][j] = datas[i].map((v, k) => datas[j][k] - v)
				norms[i][j] = Math.sqrt(diffs[i][j].reduce((s, v) => s + v ** 2, 0))
			}
		}
		for (let i = 0; i < n; i++) {
			distances[i].sort((a, b) => a.d - b.d)
		}

		const lb_abof = []
		for (let i = 0; i < n; i++) {
			const d = []
			const nnorm = []
			for (let j = 1; j < n && j <= this._k; j++) {
				const t = distances[i][j].i
				d.push(diffs[i][t])
				nnorm.push(norms[i][t])
			}
			const r1 = 0
			const r2 =
				norms[i].reduce((s, v) => s + (v === 0 ? 0 : 1 / v ** 3), 0) * 2 -
				nnorm.reduce((s, v) => s + (v === 0 ? 0 : 1 / v ** 3), 0) * 2
			const den = norms[i].reduce((s, v) => s + (v === 0 ? 0 : 1 / v), 0) * 2

			let num1 = r1
			let num2 = r2
			for (let s = 0; s < d.length; s++) {
				for (let t = 0; t < d.length; t++) {
					if (s === t) {
						continue
					}
					const sp = d[s].reduce((s, v, k) => s + v * d[t][k], 0)
					const num = sp / (nnorm[s] * nnorm[t]) ** 3
					num1 += num ** 2
					num2 += num
				}
			}
			lb_abof[i] = [num1 / den - (num2 / den) ** 2, i]
		}
		lb_abof.sort((a, b) => a[0] - b[0])

		const outlierIdxs = []
		for (let k = 0; k < n; k++) {
			const i = lb_abof[k][1]

			let num1 = 0
			let num2 = 0
			let sum = 0
			for (let s = 0; s < n; s++) {
				if (s === i) {
					continue
				}
				for (let t = 0; t < n; t++) {
					if (t === i) {
						continue
					}
					const sp = diffs[i][s].reduce((s, v, k) => s + v * diffs[i][t][k], 0)
					const num = sp / (norms[i][s] * norms[i][t]) ** 3
					num1 += num ** 2
					num2 += num
					sum += 1 / (norms[i][s] * norms[i][t])
				}
			}
			const abod = num1 / sum - (num2 / sum) ** 2
			if (outlierIdxs.length < this._l) {
				outlierIdxs.push([abod, i])
			} else if (abod < outlierIdxs[outlierIdxs.length - 1][0]) {
				outlierIdxs.pop()
				outlierIdxs.push([abod, i])
				outlierIdxs.sort((a, b) => a[0] - b[0])
			} else {
				break
			}
		}
		const outliers = Array(n).fill(false)
		for (let i = 0; i < outlierIdxs.length; i++) {
			outliers[outlierIdxs[i][1]] = true
		}
		return outliers
	}
}
