/**
 * COPula-based Outlier Detector)
 */
export default class COPOD {
	// COPOD: Copula-Based Outlier Detection
	// https://arxiv.org/abs/2009.09463
	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<number>>} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const d = data[0].length

		const u = Array.from({ length: n }, () => [])
		const v = Array.from({ length: n }, () => [])
		const w = Array.from({ length: n }, () => [])
		for (let t = 0; t < d; t++) {
			const xd = data.map((v, i) => ({ v: v[t], i }))
			const m = xd.reduce((s, v) => s + v.v, 0) / n
			let d2 = 0
			let d3 = 0
			for (let i = 0; i < n; i++) {
				d2 += (xd[i].v - m) ** 2
				d3 += (xd[i].v - m) ** 3
			}
			const b = d3 / n / Math.cbrt(d2 / (n - 1))
			xd.sort((a, b) => a.v - b.v)

			for (let i = 0; i < n; i++) {
				const ui = (i + 1) / n
				const vi = 1 - i / n
				u[xd[i].i][t] = ui
				v[xd[i].i][t] = vi
				w[xd[i].i][t] = b < 0 ? ui : vi
			}
		}

		const o = []
		for (let i = 0; i < n; i++) {
			const pl = -u[i].reduce((s, v) => s + Math.log(v), 0)
			const pr = -v[i].reduce((s, v) => s + Math.log(v), 0)
			const ps = -w[i].reduce((s, v) => s + Math.log(v), 0)
			o[i] = Math.max(pl, pr, ps)
		}

		return o
	}
}
