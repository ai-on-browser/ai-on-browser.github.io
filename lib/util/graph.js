import Matrix from './matrix.js'

export default class Graph {
	/**
	 * @param {number} nodes Number of nodes
	 * @param {([number, number] | [number, number, number])[]} edges Edges
	 */
	constructor(nodes, edges) {
		this._n = nodes
		this._edges = edges
	}

	/**
	 * Returns graph from adjacency matrix.
	 *
	 * @param {number[][] | boolean[][]} mat Adjacency matrix
	 * @returns {Graph} Graph from adjacency matrix
	 */
	static fromAdjacency(mat) {
		const n = mat.length
		const e = []
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (mat[i][j]) {
					e.push([i, j, +mat[i][j]])
				}
			}
		}
		return new Graph(n, e)
	}

	/**
	 * Number of nodes
	 *
	 * @type {number}
	 */
	get order() {
		return this._n
	}

	/**
	 * Number of edges
	 *
	 * @type {number}
	 */
	get size() {
		return this._edges.length
	}

	/**
	 * Edges
	 *
	 * @type {[number, number][]}
	 */
	get edges() {
		return this._edges
	}

	/**
	 * Adjacency matrix
	 *
	 * @type {number[][]}
	 */
	get adjacencyMatrix() {
		const a = Array.from({ length: this._n }, () => Array(this._n).fill(0))
		for (const [i, j, v] of this._edges) {
			a[i][j] = v || 1
		}
		return a
	}

	/**
	 * Returns degree matrix.
	 *
	 * @returns {number[][]} Degree matrix
	 */
	degreeMatrix() {
		const amat = this.adjacencyMatrix
		const dm = []
		for (let i = 0; i < this._n; i++) {
			dm[i] = Array(this._n).fill(0)
			for (let j = 0; j < this._n; j++) {
				dm[i][i] += amat[i][j]
			}
		}
		return dm
	}

	/**
	 * Returns laplacian matrix.
	 *
	 * @returns {number[][]} Laplacian matrix
	 */
	laplacianMatrix() {
		const amat = this.adjacencyMatrix
		const lm = []
		for (let i = 0; i < this._n; i++) {
			lm[i] = amat[i].map(v => -v)
			for (let j = 0; j < this._n; j++) {
				lm[i][i] += amat[i][j]
			}
		}
		return lm
	}

	/**
	 * Returns cut size.
	 *
	 * @param {number[]} s Subset
	 * @param {number[]} t Subset
	 * @returns {number} Cut size
	 */
	cut(s, t) {
		const amat = this.adjacencyMatrix
		let c = 0
		for (let i = 0; i < s.length; i++) {
			for (let j = 0; j < t.length; j++) {
				c += amat[s[i]][t[j]]
			}
		}
		return c
	}

	/**
	 * Returns minimum cut.
	 *
	 * @param {number} [minv=1] Minimum number for subset
	 * @returns {[number, number[][]]} Cut value and subset nodes
	 */
	mincut(minv = 1) {
		if (minv > Math.floor(this._n / 2)) {
			throw new Error(`Invalid minv. ${minv}, ${this._n}`)
		}
		if (this._n <= 6) {
			return this.mincutBruteForce(minv)
		}
		let [mincut, nodes] = this.mincutStoerWagner(minv)
		for (let i = 1; i < this._n && mincut !== Infinity; i++) {
			;[mincut, nodes] = this.mincutStoerWagner(minv, i)
		}
		if (mincut === Infinity) {
			;[mincut, nodes] = this.mincutKargersStein(minv)
		}
		return [mincut, nodes]
	}

	/**
	 * Returns minimum cut.
	 *
	 * @param {number} [minv=1] Minimum number for subset
	 * @returns {[number, number[][]]} Cut value and subset nodes
	 */
	mincutBruteForce(minv = 1) {
		const amat = this.adjacencyMatrix
		const cutFlg = Array(this._n).fill(false)
		let mincutnodes = null
		let mincut = Infinity
		do {
			const node1 = []
			const node2 = []
			for (let i = 0; i < this._n; i++) {
				if (cutFlg[i]) {
					node1.push(i)
				} else {
					node2.push(i)
				}
			}
			if (node1.length >= minv && node2.length >= minv) {
				let cut = 0
				for (let i = 0; i < node1.length; i++) {
					for (let j = 0; j < node2.length; j++) {
						if (amat[node1[i]][node2[j]]) {
							cut += amat[node1[i]][node2[j]]
						}
					}
				}
				if (cut < mincut) {
					mincut = cut
					mincutnodes = [node1, node2]
				}
			}
			if (mincut === 0) {
				return [0, mincutnodes]
			}
			for (let i = 0; i < this._n; i++) {
				if (!cutFlg[i]) {
					cutFlg[i] = true
					break
				}
				cutFlg[i] = false
			}
		} while (cutFlg.some(f => f))
		return [mincut, mincutnodes]
	}

	/**
	 * Returns minimum cut.
	 *
	 * @param {number} [minv=1] Minimum number for subset
	 * @param {number} [startnode=0] Start node index
	 * @returns {[number, number[][]]} Cut value and subset nodes
	 */
	mincutStoerWagner(minv = 1, startnode = 0) {
		const amat = this.adjacencyMatrix
		const co = Array.from({ length: this._n }, (_, i) => [i])
		let mincutnodes = null
		let mincut = Infinity
		const weight = amat.map(v => v.concat())
		for (let i = 1; i < this._n; i++) {
			const w = weight[startnode].concat()
			let s = 0
			let t = startnode
			for (let k = 0; k < this._n - i; k++) {
				w[t] = -Infinity
				s = t
				let maxw = -Infinity
				for (let m = 0; m < w.length; m++) {
					if (w[m] > maxw) {
						maxw = w[m]
						t = m
					}
				}
				for (let m = 0; m < this._n; m++) {
					w[m] += weight[t][m]
				}
			}
			if (w[t] - weight[t][t] < mincut && co[t].length >= minv && this._n - co[t].length >= minv) {
				mincut = w[t] - weight[t][t]
				mincutnodes = co[t].concat()
			}
			co[s].push(...co[t])
			for (let j = 0; j < this._n; j++) {
				weight[j][s] = weight[s][j] += weight[t][j]
			}
			weight[startnode][t] = -Infinity
		}
		if (!mincutnodes) {
			return [mincut, [Array.from({ length: this._n }, (_, i) => i)]]
		}
		const mc = []
		for (let i = 0; i < this._n; i++) {
			if (mincutnodes.indexOf(i) < 0) {
				mc.push(i)
			}
		}
		return [mincut, [mincutnodes, mc]]
	}

	/**
	 * Returns minimum cut.
	 *
	 * @param {number} [minv=1] Minimum number for subset
	 * @param {number} [trials] Trial count
	 * @returns {[number, number[][]]} Cut value and subset nodes
	 */
	mincutKargers(minv = 1, trials = null) {
		const amat = this.adjacencyMatrix
		let mincutnodes = null
		let mincut = Infinity
		if (trials == null) {
			trials = this._n ** 2 * Math.log(this._n)
		}
		const edges = []
		let edgeCounts = 0
		for (let i = 0; i < this._n; i++) {
			edges[i] = new Set()
			for (let j = 0; j < this._n; j++) {
				if (amat[i][j]) {
					edges[i].add(j)
					edgeCounts++
				}
			}
		}
		for (let t = 0; t < trials; t++) {
			const nodes = Array.from({ length: this._n }, (_, i) => [i])
			const g = amat.map(v => v.concat())
			const e = edges.map(v => new Set(v))
			let size = edgeCounts
			let u = 0
			for (let c = 0; c < this._n - 2 && size > 0; c++) {
				let p = Math.floor(Math.random() * size)
				for (u = 0; u < this._n && e[u].size <= p; u++) {
					p -= e[u].size
				}
				let v = 0
				for (const ev of e[u]) {
					if (p === 0) {
						v = ev
						break
					}
					p--
				}

				for (const k of e[v]) {
					e[k].delete(v)
					size -= 1
					if (k === u) {
						continue
					}
					if (!g[u][k]) {
						e[u].add(k)
						e[k].add(u)
						size += 2
					}
					g[u][k] += g[v][k]
					g[k][u] += g[k][v]
				}
				nodes[u].push(...nodes[v])
				nodes[v] = null
				size -= e[v].size
				e[v].clear()
			}
			if (size === 0) {
				return [0, nodes.filter(v => v !== null)]
			}
			const v = e[u].values().next().value
			if (nodes[u].length < minv || nodes[v].length < minv) {
				continue
			}
			if (g[u][v] < mincut) {
				mincut = g[u][v]
				mincutnodes = [nodes[u], nodes[v]]
			}
		}
		if (!mincutnodes) {
			return [mincut, [Array.from({ length: this._n }, (_, i) => i)]]
		}
		return [mincut, mincutnodes]
	}

	/**
	 * Returns minimum cut.
	 *
	 * @param {number} [minv=1] Minimum number for subset
	 * @param {number} [trials] Trial count
	 * @returns {[number, number[][]]} Cut value and subset nodes
	 */
	mincutKargersStein(minv = 1, trials = null) {
		const amat = this.adjacencyMatrix
		const nodes = Array.from({ length: this._n }, (_, i) => [i])
		if (trials === null) {
			trials = Math.log(this._n) ** 2
		}
		let mincutnodes = null
		let mincut = Infinity
		for (let i = 0; i < trials; i++) {
			const [cut, cutnodes] = this._mincutKargersStein0(amat, nodes, minv)
			if (cut < mincut) {
				mincut = cut
				mincutnodes = cutnodes
			}
		}
		return [mincut, mincutnodes]
	}

	_mincutKargersStein0(amat, nodes, minv) {
		const n = amat.length
		if (n <= 6) {
			const cutFlg = Array(n).fill(false)
			let mincutnodes = null
			let mincut = Infinity
			do {
				const node1 = []
				const node2 = []
				for (let i = 0; i < n; i++) {
					if (cutFlg[i]) {
						node1.push(i)
					} else {
						node2.push(i)
					}
				}
				const node1c = node1.reduce((s, n1) => s + nodes[n1].length, 0)
				const node2c = node2.reduce((s, n1) => s + nodes[n1].length, 0)
				if (node1c >= minv && node2c >= minv) {
					let cut = 0
					for (let i = 0; i < node1.length; i++) {
						for (let j = 0; j < node2.length; j++) {
							if (amat[node1[i]][node2[j]]) {
								cut += amat[node1[i]][node2[j]]
							}
						}
					}
					if (cut < mincut) {
						mincut = cut
						mincutnodes = [
							node1.reduce((s, n) => s.concat(nodes[n]), []),
							node2.reduce((s, n) => s.concat(nodes[n]), []),
						]
					}
				}
				if (mincut === 0) {
					return [0, mincutnodes]
				}
				for (let i = 0; i < n; i++) {
					if (!cutFlg[i]) {
						cutFlg[i] = true
						break
					}
					cutFlg[i] = false
				}
			} while (cutFlg.some(f => f))
			return [mincut, mincutnodes]
		}

		const edges = []
		let edgeCounts = 0
		for (let i = 0; i < n; i++) {
			edges[i] = new Set()
			for (let j = 0; j < n; j++) {
				if (amat[i][j]) {
					edges[i].add(j)
					edgeCounts++
				}
			}
		}

		const k = n / Math.sqrt(2) + 1
		let mincutnodes = null
		let mincut = Infinity
		for (let it = 0; it < 2; it++) {
			const nds = nodes.map(n1 => n1.concat())
			const g = amat.map(v => v.concat())
			const e = edges.map(e => new Set(e))

			let size = edgeCounts
			let u = 0
			const delidx = []
			for (let c = 0; c < n - k; c++) {
				let p = Math.floor(Math.random() * size)
				for (u = 0; u < this._n && e[u].size <= p; u++) {
					p -= e[u].size
				}
				let v = 0
				for (const ev of e[u]) {
					if (p === 0) {
						v = ev
						break
					}
					p--
				}

				for (const k of e[v]) {
					e[k].delete(v)
					size -= 1
					if (k === u) {
						continue
					}
					if (!g[u][k]) {
						e[u].add(k)
						e[k].add(u)
						size += 2
					}
					g[u][k] += g[v][k]
					g[k][u] += g[k][v]
				}
				nds[u].push(...nds[v])
				nds[v] = null
				size -= e[v].size
				e[v].clear()
				delidx.push(v)
			}
			delidx.sort((a, b) => b - a)

			for (let i = n - 1; i >= 0; i--) {
				if (nds[i] === null) {
					g.splice(i, 1)
					nds.splice(i, 1)
				} else {
					for (let j = 0; j < delidx.length; j++) {
						g[i].splice(delidx[j], 1)
					}
				}
			}

			const [cut, cutnodes] = this._mincutKargersStein0(g, nds, minv)
			if (cut < mincut) {
				mincut = cut
				mincutnodes = cutnodes
			}
		}
		return [mincut, mincutnodes]
	}

	/**
	 * Returns bisection cut.
	 *
	 * @returns {[number, number[][]]} Cut value and subset nodes
	 */
	bisectionSpectral() {
		const lmat = Matrix.fromArray(this.laplacianMatrix())
		const mat = lmat.tridiagLanczos()

		const evalues = mat.eigenValuesQR()
		const [, evec] = mat.eigenInverseIteration(evalues[1])
		const med = evec.median()
		const n1 = []
		const n2 = []
		for (let i = 0; i < this._n; i++) {
			if (evec.at(i, 0) > med) {
				n1.push(i)
			} else {
				n2.push(i)
			}
		}
		const cut = this.cut(n1, n2)
		return [cut, [n1, n2]]
	}
}
