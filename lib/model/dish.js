class PriorityQueue {
	constructor(arr) {
		this._value = arr || []
	}

	get length() {
		return this._value.length
	}

	[Symbol.iterator]() {
		return this._value[Symbol.iterator]()
	}

	_sort() {
		this._value.sort((a, b) => a[1] - b[1])
	}

	push(value, priority) {
		this._value.push([value, priority])
		this._sort()
	}

	move(value, priority) {
		for (let i = 0; i < this.length; i++) {
			if (this._value[i][0] === value) {
				this._value[i][1] = priority
				this._sort()
				return
			}
		}
		this.push(value, priority)
	}

	shift() {
		const [value] = this._value.shift()
		return value
	}
}

/**
 * Detecting Subspace cluster Hierarchies
 */
export default class DiSH {
	// Detection and Visualization of Subspace Cluster Hierarchies
	// https://imada.sdu.dk/u/zimek/publications/DASFAA2007/detection.pdf
	/**
	 * @param {number} mu Number of neighborhood
	 * @param {number} e Neighborhood range
	 */
	constructor(mu, e) {
		this._mu = mu
		this._e = e
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} x Training data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		const n = x.length
		const a = x[0].length
		const w = []
		for (let i = 0; i < n; i++) {
			const nears = []
			for (let k = 0; k < a; k++) {
				nears[k] = new Set()
				for (let j = 0; j < n; j++) {
					if (Math.abs(x[i][k] - x[j][k]) <= this._e) {
						nears[k].add(j)
					}
				}
			}
			const c = new Set()
			let max_n = -1
			let max_k = -1
			for (let k = 0; k < a; k++) {
				if (nears[k].size >= this._mu) {
					if (max_n < 0) {
						max_n = nears[k].size
						max_k = k
					} else if (nears[k].size < max_n) {
						c.add(max_k)
						max_n = nears[k].size
						max_k = k
					} else {
						c.add(k)
					}
				}
			}
			w[i] = Array(a).fill(0)
			if (max_k < 0) {
				continue
			}
			w[i][max_k] = 1

			let int = nears[max_k]
			while (c.length > 0) {
				let max_n = -1
				let max_k = -1
				for (const k of c) {
					const intn = new Set()
					for (const a of int) {
						if (nears[k].has(a)) {
							intn.add(a)
						}
					}
					nears[k] = intn
					if (nears[k].size >= max_n) {
						max_n = nears[k].size
						max_k = k
					}
				}
				if (max_n < this._mu) {
					break
				}
				w[i][max_k] = 1
				c.delete(max_k)
				int = nears[max_k]
			}
		}

		const queue = new PriorityQueue()
		for (let i = 0; i < n; i++) {
			queue.push(i, Infinity)
		}

		const sdists = []
		for (let i = 0; i < n; i++) {
			sdists[i] = []
			sdists[i][i] = [i, 0]
			for (let j = 0; j < i; j++) {
				let lambda = 0
				let sd = 0
				for (let k = 0; k < a; k++) {
					if (w[i][k] === 0 || w[j][k] === 0) {
						lambda++
					}
					if (w[i][k] === 1 && w[j][k] === 1) {
						sd += (x[i][k] - x[j][k]) ** 2
					}
				}
				const d = lambda + (Math.sqrt(sd) > 2 * this._e ? 1 : 0)
				sdists[i][j] = [j, d]
				sdists[j][i] = [i, d]
			}
		}

		const co = []
		while (queue.length > 0) {
			const o = queue.shift()
			const ss = sdists[o].concat()
			ss.sort((a, b) => a[1] - b[1])
			const [r] = ss[this._mu]
			for (const [p] of [...queue]) {
				const sr = Math.max(sdists[o][r][1], sdists[o][p][1])
				queue.move(p, sr)
			}
			co.push(o)
		}

		const clusters = []
		for (let i = 0; i < n; i++) {
			let c = null
			for (let t = 0; t < clusters.length; t++) {
				if (clusters[t].w.some((v, k) => v !== w[co[i]][k] * w[co[i - 1]][k])) {
					continue
				}
				let dist = 0
				for (let k = 0; k < a; k++) {
					if (clusters[t].w[k] === 1) {
						dist += (clusters[t].center[k] - x[co[i]][k]) ** 2
					}
				}
				if (Math.sqrt(dist) > 2 * this._e) {
					continue
				}
				c = t
				break
			}
			if (c == null) {
				c = clusters.length
				clusters.push({
					i: [],
					center: Array(a).fill(0),
					w: w[co[i]].concat(),
					l: w[co[i]].reduce((s, v) => s + (v === 0 ? 1 : 0), 0),
					parents: [],
				})
			}
			clusters[c].center = clusters[c].center.map(
				(v, k) => (v * clusters[c].i.length + x[co[i]][k]) / (clusters[c].i.length + 1)
			)
			clusters[c].i.push(i)
		}

		for (let i = 0; i < clusters.length; i++) {
			for (let j = 0; j < clusters.length; j++) {
				if (clusters[j].l <= clusters[i].l) {
					continue
				}
				if (clusters[j].l === a) {
					clusters[i].parents.push(j)
					continue
				}
				let dist = 0
				for (let k = 0; k < a; k++) {
					if (clusters[i].w[k] === 1 && clusters[j].w[k] === 1) {
						dist += (clusters[i].center[k] - clusters[j].center[k]) ** 2
					}
				}
				if (Math.sqrt(dist) > 2 * this._e) {
					continue
				}

				let target = true
				for (let t = 0; t < clusters[i].parents.length; t++) {
					if (clusters[clusters[i].parents[t]].l < clusters[j].l) {
						target = false
						break
					}
				}
				if (target) {
					clusters[i].parents.push(j)
				}
			}
		}
		this._clusters = clusters

		const p = []
		for (let c = 0; c < clusters.length; c++) {
			for (let i = 0; i < clusters[c].i.length; i++) {
				p[clusters[c].i[i]] = c
			}
		}
		return p
	}
}
