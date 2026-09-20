/**
 * Squeezer
 */
export default class Squeezer {
	// Squeezer: An Efficient Algorithm for Clustering Categorical Data
	// https://jcst.ict.ac.cn/en/article/pdf/preview/859
	/**
	 * @param {number} s Desired similarity threshold
	 */
	constructor(s) {
		this._s = s
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<*>>} data Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const d = data[0].length
		const clusters = []
		for (let i = 0; i < n; i++) {
			if (clusters.length === 0) {
				const summary = []
				for (let j = 0; j < d; j++) {
					summary[j] = { [data[i][j]]: 1 }
				}
				clusters.push({ c: [i], s: summary })
			} else {
				let sim_max = -Infinity
				let index = -1
				for (let k = 0; k < clusters.length; k++) {
					let sim = 0
					for (let j = 0; j < d; j++) {
						sim += (clusters[k].s[j][data[i][j]] ?? 0) / clusters[k].c.length
					}
					if (sim_max < sim) {
						sim_max = sim
						index = k
					}
				}

				if (sim_max > this._s) {
					const ci = clusters[index]
					ci.c.push(i)
					for (let j = 0; j < d; j++) {
						ci.s[j][data[i][j]] = (ci.s[j][data[i][j]] ?? 0) + 1
					}
				} else {
					const summary = []
					for (let j = 0; j < d; j++) {
						summary[j] = { [data[i][j]]: 1 }
					}
					clusters.push({ c: [i], s: summary })
				}
			}
		}
		const c = []
		for (let k = 0; k < clusters.length; k++) {
			for (const p of clusters[k].c) {
				c[p] = k
			}
		}
		return c
	}
}
