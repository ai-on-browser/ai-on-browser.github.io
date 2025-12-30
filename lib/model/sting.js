/**
 * STatistical INformation Grid-based method
 */
export default class STING {
	// https://en.wikipedia.org/wiki/Cluster_analysis
	// "STING : A Statistical Information Grid Approach to Spatial Data Mining"
	/**
	 * @param {number} c specified density
	 */
	constructor(c) {
		this._c = c
		this._cells = null
		this._t = 0.05
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const x = datas
		const n = x.length
		const dim = x[0].length
		const mins = x.reduce((m, d) => m.map((v, i) => Math.min(v, d[i])), Array(dim).fill(Infinity))
		const maxs = x.reduce((m, d) => m.map((v, i) => Math.max(v, d[i])), Array(dim).fill(-Infinity))
		const ranges = mins.map((m, i) => [m, maxs[i]])
		this._cells = {
			ranges: ranges,
			children: [],
		}
		let layer = [this._cells]
		const spl_size = 2 ** dim
		const average_number = 5
		const max_depth = Math.log(n / average_number) / Math.log(spl_size)
		const cells = [layer]
		for (let a = 0; a < max_depth; a++) {
			const new_stack = []
			for (const c of layer) {
				const rng = c.ranges
				for (let i = 0; i < spl_size; i++) {
					let p = i
					const r = []
					for (let k = 0; k < dim; k++) {
						const m = (rng[k][1] + rng[k][0]) / 2
						if (p % 2 === 0) {
							r.push([rng[k][0], m])
						} else {
							r.push([m, rng[k][1]])
						}
						p = Math.floor(p / 2)
					}
					const t = {
						ranges: r,
						children: [],
					}
					new_stack.push(t)
					c.children.push(t)
				}
			}
			layer = new_stack
			cells.push(layer)
		}

		let bottomSpace = 1
		for (let d = 0; d < dim; d++) {
			const range = layer[0].ranges[d]
			bottomSpace *= range[1] - range[0]
		}
		for (let i = 0; i < layer.length; i++) {
			const c = layer[i]
			const d = x.filter(v => {
				return c.ranges.every((r, i) => r[0] <= v[i] && (r[1] === maxs[i] ? v[i] <= r[1] : v[i] < r[1]))
			})
			c.n = d.length
			c.min = Array(dim).fill(Infinity)
			c.max = Array(dim).fill(-Infinity)
			const sum = Array(dim).fill(0)
			for (let j = 0; j < c.n; j++) {
				for (let k = 0; k < dim; k++) {
					sum[k] += d[j][k]
					c.min[k] = Math.min(c.min[k], d[j][k])
					c.max[k] = Math.max(c.max[k], d[j][k])
				}
			}
			c.m = sum.map(v => (c.n > 0 ? v / c.n : 0))
			const s = Array(dim).fill(0)
			for (let j = 0; j < c.n; j++) {
				for (let k = 0; k < dim; k++) {
					s[k] += (d[j][k] - c.m[k]) ** 2
				}
			}
			c.s = s.map(v => (c.n > 0 ? Math.sqrt(v / c.n) : 0))
			c.dist = Array(dim).fill('normal')

			c.area = bottomSpace
		}
		for (let k = cells.length - 2; k >= 0; k--) {
			for (let i = 0; i < cells[k].length; i++) {
				let nki = 0
				let aki = 0
				const sum = Array(dim).fill(0)
				const min = (cells[k][i].min = Array(dim).fill(Infinity))
				const max = (cells[k][i].max = Array(dim).fill(-Infinity))
				const s = Array(dim).fill(0)
				const ccells = cells[k + 1].slice(i * spl_size, (i + 1) * spl_size)
				for (const ccell of ccells) {
					nki += ccell.n
					aki += ccell.area
					for (let p = 0; p < dim; p++) {
						sum[p] += ccell.m[p] * ccell.n
						min[p] = Math.min(min[p], ccell.min[p])
						max[p] = Math.max(max[p], ccell.max[p])
						s[p] += (ccell.s[p] ** 2 + ccell.m[p] ** 2) * ccell.n
					}
				}
				cells[k][i].n = nki
				cells[k][i].m = sum.map(v => (nki > 0 ? v / nki : 0))
				cells[k][i].s = s.map((v, p) => (nki > 0 ? Math.sqrt(v / nki - (sum[p] / nki) ** 2) : 0))
				const eps = 0.1
				cells[k][i].dist = Array(dim).fill('normal')
				cells[k][i].area = aki
				for (let d = 0; d < dim; d++) {
					let confl = 0
					let dist = 'normal'
					for (const ccell of ccells) {
						let mdiff = 0
						let sdiff = 0
						if (cells[k][i].m[d] !== 0) {
							mdiff += Math.abs((cells[k][i].m[d] - ccell.m[d]) / cells[k][i].m[d])
						} else if (ccell.m[d] !== 0) {
							mdiff += Math.abs((cells[k][i].m[d] - ccell.m[d]) / ccell.m[d])
						}
						if (cells[k][i].s[d] !== 0) {
							sdiff += Math.abs((cells[k][i].s[d] - ccell.s[d]) / cells[k][i].s[d])
						} else if (ccell.s[d] !== 0) {
							sdiff += Math.abs((cells[k][i].s[d] - ccell.s[d]) / ccell.s[d])
						}
						if (dist !== ccell.dist && mdiff < eps && sdiff < eps) {
							confl += ccell.n
						} else if (mdiff >= eps || sdiff >= eps) {
							confl = nki
						}
					}
					if (nki > 0 && confl / nki > this._t) {
						dist = 'none'
					}
					cells[k][i].dist[d] = dist
				}
			}
		}

		let relevantCells = [this._cells]
		for (let k = 1; k < cells.length; k++) {
			const childRelevantCells = []
			for (let i = 0; i < relevantCells.length; i++) {
				for (const child of relevantCells[i].children) {
					if (child.n < child.area * this._c) {
						continue
					}
					childRelevantCells.push(child)
				}
			}
			relevantCells = childRelevantCells
		}

		this._clusters = []
		const stack = []
		while (true) {
			if (stack.length === 0) {
				if (relevantCells.length === 0) {
					break
				}
				stack.push(relevantCells.pop())
				this._clusters.push([])
			}
			const curcell = stack.pop()
			this._clusters[this._clusters.length - 1].push(curcell)

			for (let k = relevantCells.length - 1; k >= 0; k--) {
				const c = relevantCells[k]
				let adjointCnt = 0
				for (let d = 0; d < dim && adjointCnt < 2; d++) {
					if (curcell.ranges[d][0] === c.ranges[d][0] && curcell.ranges[d][1] === c.ranges[d][1]) {
					} else if (curcell.ranges[d][0] === c.ranges[d][1] || curcell.ranges[d][1] === c.ranges[d][0]) {
						adjointCnt++
					} else {
						adjointCnt = Infinity
					}
				}
				if (adjointCnt === 1) {
					stack.push(c)
					relevantCells.splice(k, 1)
				}
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const p = []
		for (let i = 0; i < datas.length; i++) {
			p[i] = -1
			for (let k = 0; k < this._clusters.length && p[i] < 0; k++) {
				for (const cell of this._clusters[k]) {
					if (datas[i].every((v, d) => cell.ranges[d][0] <= v && v <= cell.ranges[d][1])) {
						p[i] = k
						break
					}
				}
			}
		}
		return p
	}
}
