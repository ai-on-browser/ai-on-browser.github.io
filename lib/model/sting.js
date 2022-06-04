/**
 * STatistical INformation Grid-based method
 *
 * @deprecated Not implemented
 */
export default class STING {
	// https://en.wikipedia.org/wiki/Cluster_analysis
	// "STING : A Statistical Information Grid Approach to Spatial Data Mining"
	constructor() {
		this._cells = null
	}

	/**
	 * Fit model.
	 *
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
		let stack = [this._cells]
		const spl_size = 2 ** dim
		const average_number = 20
		const max_depth = Math.log(n / average_number) / Math.log(spl_size)
		const cells = [stack]
		for (let a = 0; a < max_depth; a++) {
			const new_stack = []
			for (const c of stack) {
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
			stack = new_stack
			cells.push(stack)
		}
		for (let i = 0; i < stack.length; i++) {
			const c = stack[i]
			const d = x.filter(v => {
				return c.ranges.every((r, i) => r[0] <= v[i] && (r[1] === maxs[i] ? v[i] <= r[1] : v[i] < r[1]))
			})
			const n = (c.n = d.length)
			const m = Array(dim).fill(0)
			const min = (c.min = Array(dim).fill(Infinity))
			const max = (c.max = Array(dim).fill(-Infinity))
			for (let j = 0; j < n; j++) {
				for (let k = 0; k < dim; k++) {
					m[k] += d[j][k]
					min[k] = Math.min(min[k], d[j][k])
					max[k] = Math.max(max[k], d[j][k])
				}
			}
			c.m = m.map(v => (n > 0 ? v / n : 0))
			const s = Array(dim).fill(0)
			for (let j = 0; j < n; j++) {
				for (let k = 0; k < dim; k++) {
					s[k] += (d[j][k] - m[k]) ** 2
				}
			}
			c.s = s.map(v => (n > 0 ? Math.sqrt(v / n) : 0))
		}
		for (let k = cells.length - 2; k >= 0; k--) {
			for (let i = 0; i < cells[k].length; i++) {
				let n = 0
				const m = Array(dim).fill(0)
				const min = (cells[k][i].min = Array(dim).fill(Infinity))
				const max = (cells[k][i].max = Array(dim).fill(-Infinity))
				const s = Array(dim).fill(0)
				for (const ccell of cells[k + 1].slice(i * spl_size, (i + 1) * spl_size)) {
					n += ccell.n
					for (let p = 0; p < dim; p++) {
						m[p] += ccell.m[p] * ccell.n
						min[p] = Math.min(min[p], ccell.min[p])
						max[p] = Math.max(max[p], ccell.max[p])
						s[p] += (ccell.s[p] ** 2 + ccell.m[p] ** 2) * ccell.n
					}
				}
				cells[k][i].n = n
				cells[k][i].m = m.map(v => (n > 0 ? v / n : 0))
				cells[k][i].s = s.map((v, p) => (n > 0 ? Math.sqrt(v / n - m[p] ** 2) : 0))
			}
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {}
}
