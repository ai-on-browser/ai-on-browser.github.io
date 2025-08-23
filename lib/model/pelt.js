/**
 * Pruned Exact Linear Time
 */
export default class PELT {
	// Optimal detection of changepoints with a linear computational cost
	// https://arxiv.org/pdf/1101.1438
	// https://github.com/deepcharles/ruptures
	/**
	 * @param {number} beta Penalty constant
	 * @param {"rbf" | "l1" | "l2"} cost Measure of data
	 */
	constructor(beta, cost = 'rbf') {
		this._jump = 1
		this._min_size = 1
		this._penalty = beta
		this._k = beta

		if (cost === 'rbf') {
			this._cost = (() => {
				const k = []
				return (data, s, e) => {
					if (k.length === 0) {
						for (let i = 0; i < data.length; i++) {
							k[i] = []
							for (let j = 0; j < i; j++) {
								k[i][j] = Math.exp(-data[i].reduce((s, v, t) => s + (v - data[j][t]) ** 2, 0))
							}
						}
					}

					let c = 0
					for (let i = s; i < e; i++) {
						for (let j = s; j < i; j++) {
							c -= k[i][j] * 2
						}
					}
					return c / (e - s)
				}
			})()
		} else if (cost === 'l1') {
			this._min_size = 2
			this._cost = (data, s, e) => {
				const d = data.slice(s, e)
				const dim = d[0].length
				let c = 0
				for (let j = 0; j < dim; j++) {
					const dj = d.map(d => d[j])
					dj.sort((a, b) => a - b)
					const median =
						dj.length % 2 === 0 ? (dj[dj.length / 2] + dj[dj.length / 2 - 1]) / 2 : dj[(dj.length - 1) / 2]
					for (let i = 0; i < e - s; i++) {
						c += Math.abs(d[i][j] - median)
					}
				}
				return c
			}
		} else if (cost === 'l2') {
			this._cost = (data, s, e) => {
				const d = data.slice(s, e)
				const dim = d[0].length
				let c = 0
				for (let j = 0; j < dim; j++) {
					const mean = d.reduce((s, v) => s + v[j], 0) / d.length
					for (let i = 0; i < e - s; i++) {
						c += (d[i][j] - mean) ** 2
					}
				}
				return c
			}
		}
	}

	/**
	 * Returns changepoint or not.
	 * @param {number[]} datas Training data
	 * @returns {boolean[]} Predicted values
	 */
	predict(datas) {
		const n = datas.length

		const partitions = [[0]]
		let admissible = []

		const idx = []
		for (let i = 0; i < n; i += this._jump) {
			if (i >= this._min_size) {
				idx.push(i)
			}
		}
		idx.push(n)

		for (const backPoint of idx) {
			const admPoint = Math.floor((backPoint - this._min_size) / this._jump) * this._jump
			admissible.push(admPoint)

			let bestPartition = null
			let bestCost = Infinity
			const subpart = []
			for (const t of admissible) {
				if (!partitions[t]) {
					subpart.push(null)
					continue
				}
				const part = partitions[t].concat()
				part[backPoint] = this._cost(datas, t, backPoint) + this._penalty
				const cost = part.reduce((s, v) => s + v, 0)
				if (cost < bestCost) {
					bestPartition = part
					bestCost = cost
				}
				subpart.push(part)
			}

			partitions[backPoint] = bestPartition
			admissible = admissible.filter((_, i) => {
				return subpart[i] && subpart[i].reduce((s, v) => s + v, 0) <= bestCost + this._k
			})
		}

		this._partitions = partitions[n]
		const pred = Array(datas.length).fill(false)
		this._partitions.forEach((_, i) => {
			if (i > 0 && i < datas.length) {
				pred[i] = true
			}
		})
		return pred
	}
}
