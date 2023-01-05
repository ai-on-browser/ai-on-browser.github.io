import Matrix from './matrix.js'

/**
 * Exception for graph class
 */
export class GraphException extends Error {
	/**
	 * @param {string} message Error message
	 * @param {*} value Some value
	 */
	constructor(message, value) {
		super(message)
		this.value = value
		this.name = 'GraphException'
	}
}

/**
 * Edge of graph
 */
export class Edge {
	/**
	 * @param {number} from Index of the starting node of the edge
	 * @param {number} to Index of the end node of the edge
	 * @param {unknown} [value=null] Value of the edge
	 * @param {boolean} [direct=false] `true` if the edge is direct
	 */
	constructor(from, to, value = null, direct = false) {
		this[0] = from
		this[1] = to
		this.value = value ?? 1
		this.direct = direct
		this.weighted = value != null
	}

	get value0() {
		return this.weighted ? this.value : null
	}
}

/**
 * Graph class
 */
export default class Graph {
	/**
	 * @param {number | unknown[]} [nodes=0] Number of nodes or values of nodes
	 * @param {([number, number] | Edge)[]} [edges=[]] Edges
	 */
	constructor(nodes = 0, edges = []) {
		if (Array.isArray(nodes)) {
			this._nodes = nodes
		} else {
			this._nodes = Array(nodes)
		}
		this._edges = edges.map(e => new Edge(e[0], e[1], e instanceof Edge ? e.value0 : e.value, e.direct))
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
			for (let j = 0; j <= i; j++) {
				if (!mat[i][j] && !mat[j][i]) {
					continue
				}
				if (mat[i][j] === mat[j][i]) {
					e.push(new Edge(j, i, +mat[i][j]))
				} else {
					if (mat[i][j]) {
						e.push(new Edge(i, j, +mat[i][j], true))
					}
					if (mat[j][i]) {
						e.push(new Edge(j, i, +mat[j][i], true))
					}
				}
			}
		}
		return new Graph(n, e)
	}

	/**
	 * Returns complete graph.
	 *
	 * @param {number} n Size of the graph
	 * @returns {Graph} Complete graph
	 */
	static complete(n) {
		const e = []
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				e.push([i, j])
			}
		}
		return new Graph(n, e)
	}

	/**
	 * Returns complete bipartite graph.
	 *
	 * @param {number} n Size of the first group
	 * @param {number} m Size of the second group
	 * @returns {Graph} Complete bipartite graph
	 */
	static completeBipartite(n, m) {
		const e = []
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < m; j++) {
				e.push([i, j + n])
			}
		}
		return new Graph(n + m, e)
	}

	/**
	 * Returns cycle graph.
	 *
	 * @param {number} n Size of the graph
	 * @param {boolean} [direct=false] Direct graph or not
	 * @returns {Graph} Cycle graph
	 */
	static cycle(n, direct = false) {
		if (n < 3) {
			throw new GraphException('Index out of bounds.')
		}
		const e = []
		for (let i = 0; i < n; i++) {
			e.push(new Edge(i, (i + 1) % n, null, direct))
		}
		return new Graph(n, e)
	}

	/**
	 * Returns wheel graph.
	 *
	 * @param {number} n Size of the graph
	 * @returns {Graph} Wheel graph
	 */
	static wheel(n) {
		if (n < 4) {
			throw new GraphException('Index out of bounds.')
		}
		const e = []
		for (let i = 1; i < n; i++) {
			e.push([i, (i % (n - 1)) + 1])
			e.push([0, i])
		}
		return new Graph(n, e)
	}

	/**
	 * Returns named graph
	 *
	 * @param {'bidiakis cube' | 'bull' | 'butterfly' | 'diamond' | 'petersen'} name Name of the graph
	 * @returns {Graph} Named graph
	 */
	static fromName(name) {
		switch (name) {
			case 'bidiakis cube':
				return new Graph(12, [
					[0, 1],
					[1, 2],
					[2, 3],
					[3, 4],
					[4, 5],
					[5, 6],
					[6, 7],
					[7, 8],
					[8, 9],
					[9, 10],
					[10, 11],
					[11, 0],
					[0, 8],
					[1, 7],
					[2, 6],
					[3, 11],
					[4, 10],
					[5, 9],
				])
			case 'bull':
				return new Graph(5, [
					[0, 1],
					[1, 2],
					[1, 3],
					[2, 3],
					[3, 4],
				])
			case 'butterfly':
				return new Graph(5, [
					[0, 1],
					[0, 2],
					[1, 2],
					[2, 3],
					[2, 4],
					[3, 4],
				])
			case 'diamond':
				return new Graph(4, [
					[0, 1],
					[0, 2],
					[1, 2],
					[1, 3],
					[2, 3],
				])
			case 'petersen':
				return new Graph(10, [
					[0, 1],
					[1, 2],
					[2, 3],
					[3, 4],
					[4, 0],
					[5, 7],
					[7, 9],
					[9, 6],
					[6, 8],
					[8, 5],
					[0, 5],
					[1, 6],
					[2, 7],
					[3, 8],
					[4, 9],
				])
		}
	}

	/**
	 * Number of nodes
	 *
	 * @type {number}
	 */
	get order() {
		return this._nodes.length
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
	 * Nodes
	 *
	 * @type {unknown[]}
	 */
	get nodes() {
		return this._nodes
	}

	/**
	 * Edges
	 *
	 * @type {Edge[]}
	 */
	get edges() {
		return this._edges
	}

	/**
	 * Returns a string of DOT format.
	 *
	 * @returns {string} String of DOT format
	 */
	toDot() {
		let s = this.isUndirected() ? 'graph' : 'digraph'
		s += ' g {\n'
		for (let i = 0; i < this._nodes.length; i++) {
			s += `  ${i} [label="${JSON.stringify(this._nodes[i] ?? i).replace('"', "'")}"];\n`
		}
		for (const e of this._edges) {
			s += `  ${e[0]} ${e.direct ? '->' : '--'} ${e[1]}`
			if (e.weighted) {
				s += ` [label="${JSON.stringify(e.value).replace('"', "'")}"]`
			}
			s += ';\n'
		}
		return s + '}'
	}

	/**
	 * Returns a string represented this graph.
	 *
	 * @returns {string} String represented this graph
	 */
	toString() {
		let s = `Number of nodes: ${this._nodes.length}\n`
		if (this._nodes.some(v => v != null)) {
			s += `Node values: ${JSON.stringify(this._nodes)}\n`
		}
		s += `Number of edges: ${this._edges.length}`
		if (this._edges.length > 0) {
			s += `\nEdges`
		}
		for (const e of this._edges) {
			s += `\n  From ${e[0]} to ${e[1]}, value: ${JSON.stringify(e.value)} (${
				e.direct ? 'directed' : 'undirected'
			})`
		}
		return s
	}

	/**
	 * Returns a copy of this graph.
	 *
	 * @returns {Graph} Copied grpah
	 */
	copy() {
		const edges = this._edges.map(e => new Edge(e[0], e[1], e.value0, e.direct))
		const nodes = this._nodes.concat()
		return new Graph(nodes, edges)
	}

	/**
	 * Return degree of the node.
	 *
	 * @param {number} k Index of target node
	 * @param {boolean | 'in' | 'out'} [undirect=true] Count undirected edges. If `in` or `out` is specified, only direct edges are counted and `direct` parameter is ignored.
	 * @param {boolean | 'in' | 'out'} [direct=true] Count directed edges
	 * @returns {number} Degree of the node
	 */
	degree(k, undirect = true, direct = true) {
		if (undirect === 'in' || undirect === 'out') {
			direct = undirect
			undirect = false
		}
		let c = 0
		for (const e of this._edges) {
			if (undirect && !e.direct && (e[0] === k || e[1] === k)) {
				c++
			} else if (direct === true && e.direct && (e[0] === k || e[1] === k)) {
				c++
			} else if (direct === 'in' && e.direct && e[1] === k) {
				c++
			} else if (direct === 'out' && e.direct && e[0] === k) {
				c++
			}
		}
		return c
	}

	/**
	 * Return indexes of adjacency nodes.
	 *
	 * @param {number} k Index of target node
	 * @param {boolean | 'in' | 'out'} [undirect=true] Check undirected edges. If `in` or `out` is specified, only direct edges are checked and `direct` parameter is ignored.
	 * @param {boolean | 'in' | 'out'} [direct=true] Check directed edges
	 * @returns {number[]} Indexes of adjacency nodes
	 */
	adjacencies(k, undirect = true, direct = true) {
		if (undirect === 'in' || undirect === 'out') {
			direct = undirect
			undirect = false
		}
		const nodes = []
		const cons = Array(this._nodes.length).fill(false)
		for (const e of this._edges) {
			if (undirect && !e.direct && (e[0] === k || e[1] === k)) {
				const t = e[0] === k ? e[1] : e[0]
				if (cons[t]) continue
				nodes.push(t)
				cons[t] = true
			} else if (direct === true && e.direct && (e[0] === k || e[1] === k)) {
				const t = e[0] === k ? e[1] : e[0]
				if (cons[t]) continue
				nodes.push(t)
				cons[t] = true
			} else if (direct === 'in' && e.direct && e[1] === k) {
				if (cons[e[0]]) continue
				nodes.push(e[0])
				cons[e[0]] = true
			} else if (direct === 'out' && e.direct && e[0] === k) {
				if (cons[e[1]]) continue
				nodes.push(e[1])
				cons[e[1]] = true
			}
		}
		nodes.sort((a, b) => a - b)
		return nodes
	}

	/**
	 * Returns indexes of each components.
	 *
	 * @returns {number[][]} Indexes of each components
	 */
	components() {
		const checked = Array(this._nodes.length).fill(false)
		const stack = [0]
		const comps = []
		let curcomp = []
		while (stack.length > 0 || checked.some(v => !v)) {
			if (stack.length === 0) {
				comps.push(curcomp)
				curcomp = []
			}
			const i = stack.length > 0 ? stack.pop() : checked.indexOf(false)
			if (checked[i]) {
				continue
			}
			checked[i] = true
			curcomp.push(i)
			for (const e of this._edges) {
				if (e[0] === i) {
					stack.push(e[1])
				}
				if (e[1] === i) {
					stack.push(e[0])
				}
			}
		}
		if (curcomp.length > 0) {
			comps.push(curcomp)
		}
		return comps
	}

	/**
	 * Returns diameter of this graph.
	 *
	 * @returns {number} Diameter
	 */
	diameter() {
		const sp = this.shortestPathFloydWarshall()
		let max_len = -Infinity
		for (let i = 0; i < this._nodes.length; i++) {
			for (let j = 0; j < this._nodes.length; j++) {
				if (max_len < sp[i][j].length) {
					max_len = sp[i][j].length
				}
			}
		}
		return max_len
	}

	/**
	 * Returns eccentricity at k of this graph.
	 *
	 * @param {number} k Index of target node
	 * @returns {number} Eccentricity
	 */
	eccentricity(k) {
		const sp = this.shortestPathBellmanFord(k)
		let max_len = -Infinity
		for (let i = 0; i < this._nodes.length; i++) {
			if (max_len < sp[i].length) {
				max_len = sp[i].length
			}
		}
		return max_len
	}

	/**
	 * Returns radius of this graph.
	 *
	 * @returns {number} Radius
	 */
	radius() {
		const sp = this.shortestPathFloydWarshall()
		let r = Infinity
		for (let i = 0; i < this._nodes.length; i++) {
			let max_len = -Infinity
			for (let j = 0; j < this._nodes.length; j++) {
				if (max_len < sp[i][j].length) {
					max_len = sp[i][j].length
				}
			}
			if (r > max_len) {
				r = max_len
			}
		}
		return r
	}

	/**
	 * Returns indexes of center of this graph.
	 *
	 * @returns {number[]} Indexes of center
	 */
	center() {
		const sp = this.shortestPathFloydWarshall()
		const ecc = Array(this._nodes.length).fill(-Infinity)
		let r = Infinity
		for (let i = 0; i < this._nodes.length; i++) {
			for (let j = 0; j < this._nodes.length; j++) {
				if (ecc[i] < sp[i][j].length) {
					ecc[i] = sp[i][j].length
				}
			}
			if (r > ecc[i]) {
				r = ecc[i]
			}
		}
		const c = []
		for (let i = 0; i < ecc.length; i++) {
			if (ecc[i] === r) {
				c.push(i)
			}
		}
		return c
	}

	/**
	 * Returns girth of this graph.
	 *
	 * @returns {number} Girth
	 */
	girth() {
		let min_loop = Infinity
		for (let s = 0; s < this._nodes.length; s++) {
			const stack = [[[s], 1, Array(this._edges.length).fill(false)]]
			while (stack.length > 0) {
				const [path, len, used] = stack.shift()
				const i = path[path.length - 1]
				for (let k = 0; k < this._edges.length; k++) {
					if (used[k]) {
						continue
					}
					const e = this._edges[k]
					if (e[0] === i) {
						if (e[1] === s) {
							if (len < min_loop) {
								min_loop = len
							}
							stack.length = 0
							break
						} else if (path.indexOf(e[1]) >= 0) {
							continue
						}
						const u = used.concat()
						u[k] = true
						stack.push([path.concat(e[1]), len + 1, u])
					}
					if (!e.direct && e[1] === i) {
						if (e[0] === s) {
							if (len < min_loop) {
								min_loop = len
							}
							stack.length = 0
							break
						} else if (path.indexOf(e[1]) >= 0) {
							continue
						}
						const u = used.concat()
						u[k] = true
						stack.push([path.concat(e[0]), len + 1, u])
					}
				}
			}
		}
		return min_loop
	}

	/**
	 * Returns index of cliques.
	 *
	 * @param {number} [k] Size of clique
	 * @returns {number[][] | number[][][]} Index of cliques
	 */
	clique(k) {
		const n = this._nodes.length
		if (k != null && k > n) {
			return []
		}
		const c0 = Array.from({ length: n }, (_, i) => [i])
		if (k === 1) {
			return c0
		}
		if (n === 1) {
			return [c0]
		}
		const con = []
		const c1 = []
		for (let i = 0; i < n; i++) {
			con[i] = []
			for (let j = 0; j < i; j++) {
				if (this.getEdges(i, j).length > 0) {
					con[i][j] = true
					con[j][i] = true
					c1.push([j, i])
				}
			}
		}
		if (k === 2) {
			return c1
		}
		const K = k ?? this._nodes.length
		const c = [c0, c1]
		for (let i = 2; i < K; i++) {
			const ci = []
			for (let j = 0; j < c[i - 1].length; j++) {
				const cij = c[i - 1][j]
				for (let s = cij.at(-1) + 1; s < n; s++) {
					if (cij.every(t => con[t][s])) {
						ci.push(cij.concat(s))
					}
				}
			}
			c.push(ci)
		}
		return k == null ? c : c[k - 1]
	}

	/**
	 * Returns chromatic number of this graph.
	 *
	 * @returns {number} Chromatic number
	 */
	chromaticNumber() {
		if (this._nodes.length <= 1) {
			return this._nodes.length
		}
		if (this._edges.length === 0) {
			return 1
		}
		if (this.isBipartite()) {
			return 2
		}
		if (this.isComplete()) {
			return this._nodes.length
		}
		throw new GraphException('Not implemented')
	}

	/**
	 * Returns chromatic index of this graph.
	 *
	 * @returns {number} Chromatic index
	 */
	chromaticIndex() {
		if (this._edges.length <= 1) {
			return this._edges.length
		}
		throw new GraphException('Not implemented')
	}

	/**
	 * Returns indexes of articulation (cut) nodes.
	 *
	 * @returns {number[]} Indexes of articulation nodes
	 */
	articulations() {
		const structure = new Graph(this._nodes.length)
		for (const e of this._edges) {
			structure.addEdge(e[0], e[1], 1, e.direct)
		}
		const orgComponents = structure.components().length
		const a = []
		for (let i = 0; i < this._nodes.length; i++) {
			const g = structure.copy()
			g.removeNode(i)
			if (g.components().length > orgComponents) {
				a.push(i)
			}
		}
		return a
	}

	/**
	 * Add the node.
	 *
	 * @param {unknown} [value] Value of the node
	 */
	addNode(value) {
		this._nodes[this._nodes.length] = value
	}

	/**
	 * Returns the node value.
	 *
	 * @param {number | number[]} [k] Index of the node
	 * @returns {unknown | unknown[]} Node value
	 */
	getNode(k) {
		if (k == null) {
			return this._nodes
		}
		if (Array.isArray(k)) {
			if (k.some(i => i < 0 || this._nodes.length <= i)) {
				throw new GraphException('Index out of bounds.')
			}
			return k.map(i => this._nodes[i])
		}
		if (k < 0 || this._nodes.length <= k) {
			throw new GraphException('Index out of bounds.')
		}
		return this._nodes[k]
	}

	/**
	 * Remove the node.
	 *
	 * @param {number} k Index of the node
	 */
	removeNode(k) {
		if (k < 0 || this._nodes.length <= k) {
			throw new GraphException('Index out of bounds.')
		}
		this._nodes.splice(k, 1)
		for (let i = this._edges.length - 1; i >= 0; i--) {
			const e = this._edges[i]
			if (e[0] === k || e[1] === k) {
				this._edges.splice(i, 1)
			} else {
				if (e[0] > k) {
					e[0]--
				}
				if (e[1] > k) {
					e[1]--
				}
			}
		}
	}

	/**
	 * Add the edge.
	 *
	 * @param {number} from Index of the starting node of the edge
	 * @param {number} to Index of the end node of the edge
	 * @param {unknown} [value=null] Value of the edge
	 * @param {boolean} [direct=false] `true` if the edge is direct
	 */
	addEdge(from, to, value = null, direct = false) {
		if (from < 0 || this._nodes.length <= from || to < 0 || this._nodes.length <= to) {
			throw new GraphException('Index out of bounds.')
		}
		this._edges.push(new Edge(from, to, value, direct))
	}

	/**
	 * Returns the edges.
	 *
	 * @param {number} from Index of the starting node of the edge
	 * @param {number} to Index of the end node of the edge
	 * @param {boolean | null} [direct=null] `null` to get direct and undirect edges, `true` to get only direct edges, `false` to get only undirect edges.
	 * @returns {Edge[]} Edges between `from` to `to`
	 */
	getEdges(from, to, direct = null) {
		if (from < 0 || this._nodes.length <= from || to < 0 || this._nodes.length <= to) {
			throw new GraphException('Index out of bounds.')
		}
		const edges = []
		for (const e of this._edges) {
			if (direct === null || !direct === !e.direct) {
				if ((e[0] === from && e[1] === to) || (e[1] === from && e[0] === to)) {
					edges.push(e)
				}
			}
		}
		return edges
	}

	/**
	 * Remove the edges.
	 *
	 * @param {number} from Index of the starting node of the edge
	 * @param {number} to Index of the end node of the edge
	 * @param {boolean | null} [direct=null] `null` to remove direct and undirect edges, `true` to remove only direct edges, `false` to remove only undirect edges.
	 */
	removeEdges(from, to, direct = null) {
		if (from < 0 || this._nodes.length <= from || to < 0 || this._nodes.length <= to) {
			throw new GraphException('Index out of bounds.')
		}
		for (let i = this._edges.length - 1; i >= 0; i--) {
			const e = this._edges[i]
			if (direct === null || !direct === !e.direct) {
				if ((e[0] === from && e[1] === to) || (e[1] === from && e[0] === to)) {
					this._edges.splice(i, 1)
				}
			}
		}
	}

	/**
	 * Returns adjacency matrix
	 *
	 * @returns {number[][]} Adjacency matrix
	 */
	adjacencyMatrix() {
		const a = Array.from({ length: this._nodes.length }, () => Array(this._nodes.length).fill(0))
		for (const e of this._edges) {
			if (e.direct) {
				a[e[0]][e[1]] += e.value
			} else {
				a[e[0]][e[1]] += e.value
				a[e[1]][e[0]] += e.value
			}
		}
		return a
	}

	/**
	 * Returns adjacency list
	 *
	 * @param {'both' | 'in' | 'out'} [direct=both] Indegree or outdegree
	 * @returns {number[][]} Adjacency list
	 */
	adjacencyList(direct = 'both') {
		const n = this._nodes.length
		const a = Array.from({ length: n }, () => [])
		const conChecks = Array.from({ length: n }, () => Array(n).fill(false))
		for (const e of this._edges) {
			if (e[0] === e[1]) {
				if (!conChecks[e[0]][e[1]]) {
					a[e[0]].push(e[1])
					conChecks[e[0]][e[1]] = true
				}
			} else if (e.direct && direct !== 'both') {
				if (direct === 'in') {
					if (!conChecks[e[1]][e[0]]) {
						a[e[1]].push(e[0])
						conChecks[e[1]][e[0]] = true
					}
				} else {
					if (!conChecks[e[0]][e[1]]) {
						a[e[0]].push(e[1])
						conChecks[e[0]][e[1]] = true
					}
				}
			} else {
				if (!conChecks[e[0]][e[1]]) {
					a[e[0]].push(e[1])
				}
				if (!conChecks[e[1]][e[0]]) {
					a[e[1]].push(e[0])
				}
				conChecks[e[0]][e[1]] = conChecks[e[1]][e[0]] = true
			}
		}
		for (let i = 0; i < n; i++) {
			a[i].sort((a, b) => a - b)
		}
		return a
	}

	/**
	 * Returns degree matrix.
	 *
	 * @param {'both' | 'in' | 'out'} [direct=both] Indegree or outdegree
	 * @returns {number[][]} Degree matrix
	 */
	degreeMatrix(direct = 'both') {
		const a = Array.from({ length: this._nodes.length }, () => Array(this._nodes.length).fill(0))
		for (const e of this._edges) {
			if (e.direct && direct !== 'both') {
				if (direct === 'in') {
					a[e[1]][e[1]] += e.value
				} else {
					a[e[0]][e[0]] += e.value
				}
			} else {
				a[e[0]][e[0]] += e.value
				a[e[1]][e[1]] += e.value
			}
		}
		return a
	}

	/**
	 * Returns laplacian matrix.
	 *
	 * @returns {number[][]} Laplacian matrix
	 */
	laplacianMatrix() {
		const amat = this.adjacencyMatrix()
		const lm = []
		for (let i = 0; i < this._nodes.length; i++) {
			lm[i] = amat[i].map(v => -v)
			for (let j = 0; j < this._nodes.length; j++) {
				lm[i][i] += amat[i][j]
			}
		}
		return lm
	}

	/**
	 * Returns if this is null graph or not.
	 *
	 * @returns {boolean} `true` if this is null graph
	 */
	isNull() {
		return this._nodes.length === 0
	}

	/**
	 * Returns if this is edgeless graph or not.
	 *
	 * @returns {boolean} `true` if this is edgeless graph
	 */
	isEdgeless() {
		return this._edges.length === 0
	}

	/**
	 * Returns if this is undirected graph or not.
	 *
	 * @returns {boolean} `true` if this is undirected graph
	 */
	isUndirected() {
		return this._edges.every(e => !e.direct)
	}

	/**
	 * Returns if this is directed graph or not.
	 *
	 * @returns {boolean} `true` if this is directed graph
	 */
	isDirected() {
		return this._edges.every(e => e.direct)
	}

	/**
	 * Returns if this is mixed graph or not.
	 *
	 * @returns {boolean} `true` if this is mixed graph
	 */
	isMixed() {
		let hasDirect = false
		let hasUndirect = false
		for (const e of this._edges) {
			if (e.direct) {
				hasDirect = true
			} else {
				hasUndirect = true
			}
			if (hasDirect && hasUndirect) {
				return true
			}
		}
		return false
	}

	/**
	 * Returns if this is weighted graph or not.
	 *
	 * @returns {boolean} `true` if this is weighted graph
	 */
	isWeighted() {
		return this._edges.some(e => e.weighted)
	}

	/**
	 * Returns if this is simple graph or not.
	 *
	 * @returns {boolean} `true` if this is simple graph
	 */
	isSimple() {
		const alist = Array.from({ length: this._nodes.length }, () => [])
		for (const e of this._edges) {
			if (e[0] === e[1]) {
				return false
			}
			if (alist[e[0]].indexOf(e[1]) >= 0 || alist[e[1]].indexOf(e[0]) >= 0) {
				return false
			}
			alist[e[0]].push(e[1])
		}
		return true
	}

	/**
	 * Returns if this is connected graph or not.
	 *
	 * @returns {boolean} `true` if this is connected graph
	 */
	isConnected() {
		const con = Array(this._nodes.length).fill(false)
		const stack = [0]
		while (stack.length > 0) {
			const i = stack.pop()
			if (con[i]) {
				continue
			}
			con[i] = true
			for (const e of this._edges) {
				if (e[0] === i && !con[e[1]]) {
					stack.push(e[1])
				}
				if (!e.direct && e[1] === i && !con[e[0]]) {
					stack.push(e[0])
				}
			}
		}
		return con.every(v => v)
	}

	/**
	 * Returns if this is biconnected graph or not.
	 *
	 * @returns {boolean} `true` if this is biconnected graph
	 */
	isBiconnected() {
		const structure = new Graph(this._nodes.length)
		for (const e of this._edges) {
			structure.addEdge(e[0], e[1], 1, e.direct)
		}
		for (let i = 0; i < this._nodes.length; i++) {
			const g = structure.copy()
			g.removeNode(i)
			if (!g.isConnected()) {
				return false
			}
		}
		return true
	}

	/**
	 * Returns if this is tree or not.
	 *
	 * @returns {boolean} `true` if this is tree
	 */
	isTree() {
		return this.isConnected() && !this.hasCycle()
	}

	/**
	 * Returns if this is forest or not.
	 *
	 * @returns {boolean} `true` if this is forest
	 */
	isForest() {
		return !this.hasCycle()
	}

	/**
	 * Returns if this is bipartite graph or not.
	 *
	 * @returns {boolean} `true` if this is bipartite graph
	 */
	isBipartite() {
		const color = Array(this._nodes.length).fill(false)
		const stack = [[0, 1]]
		while (stack.length > 0 || color.some(v => !v)) {
			const [i, c] = stack.length > 0 ? stack.pop() : [color.indexOf(false), 1]
			if (color[i]) {
				if (color[i] === c) {
					continue
				}
				return false
			}
			color[i] = c
			for (const e of this._edges) {
				if (e[0] === i) {
					if (color[e[1]] === c) {
						return false
					}
					stack.push([e[1], (c % 2) + 1])
				}
				if (!e.direct && e[1] === i) {
					if (color[e[0]] === c) {
						return false
					}
					stack.push([e[0], (c % 2) + 1])
				}
			}
		}
		return true
	}

	/**
	 * Returns if this is complete graph or not.
	 *
	 * @returns {boolean} `true` if this is complete graph
	 */
	isComplete() {
		for (let i = 0; i < this._nodes.length; i++) {
			for (let j = 0; j < i; j++) {
				if (this.getEdges(i, j).length === 0) {
					return false
				}
			}
		}
		return true
	}

	/**
	 * Returns if this is regular graph or not.
	 *
	 * @returns {boolean} `true` if this is regular graph
	 */
	isRegular() {
		if (this._nodes.length <= 1) {
			return true
		}
		const d0 = this.degree(0)
		for (let i = 1; i < this._nodes.length; i++) {
			const di = this.degree(i)
			if (d0 !== di) {
				return false
			}
		}
		return true
	}

	/**
	 * Returns if this is plainer graph or not.
	 *
	 * @returns {boolean} `true` if this is plainer graph
	 */
	isPlainer() {
		const structure = new Graph(this._nodes.length)
		for (const e of this._edges) {
			structure.addEdge(e[0], e[1], 1, e.direct)
		}
		const articulations = this.articulations()
		for (let i = articulations.length - 1; i >= 0; i--) {
			structure.removeNode(articulations[i])
		}
		const components = structure.components()
		return components.every(comp => {
			const g = structure.inducedSub(comp)
			const n = g._nodes.length
			let distinctEdgeCount = 0
			const conChecks = Array.from({ length: n }, () => Array(n).fill(false))
			for (const edge of g._edges) {
				if (edge[0] !== edge[1] && !conChecks[edge[0]][edge[1]]) {
					distinctEdgeCount++
					conChecks[edge[0]][edge[1]] = conChecks[edge[1]][edge[0]] = true
				}
			}
			if (n <= 4 || distinctEdgeCount <= 8) {
				return true
			}
			if (distinctEdgeCount > 3 * n - 6) {
				return false
			}
			if (g.clique(5).length > 0) {
				return false
			}
			if (n <= 5) {
				return true
			}
			const girth = g.girth()
			if (distinctEdgeCount > (girth * (n - 2)) / (girth - 2)) {
				return false
			}

			let degreelt5 = []
			for (let i = 0; i < n; i++) {
				const di = this.adjacencies(i)
				if (di.length <= 5) degreelt5.push(i)
			}
			if (degreelt5.length === 0) {
				return false
			}

			return g.isPlainerAddVertex()
		})
	}

	/**
	 * Returns if this is plainer graph or not with add-path algorithm.
	 *
	 * On the Cutting Edge: Simplified O(n) Planarity by Edge Addition
	 * https://xuzijian629.hatenablog.com/entry/2019/12/14/163726
	 *
	 * @returns {boolean} `true` if this is plainer graph
	 */
	isPlainerAddEdge() {
		throw new Error('Not implement')
	}

	/**
	 * Returns if this is plainer graph or not with add-vertex algorithm.
	 *
	 * Hopcroft, J. and Tarjan, R. "Efficient Planarity Testing", J. ACM, Vol. 21, No. 4, pp. 549-568 (1974)
	 * 西関 隆夫. "32. グラフの平面性判定法", 情報処理, Vol. 24, No. 4, pp. 521-528 (1983)
	 * K. S. Booth, "Testing for the Consecutive Ones Property, Interval Graphs, and Graph Planarity Using PQ-Tree Algorithms", Journal of computer and system sciences, 13, pp. 335-379 (1976)
	 *
	 * @returns {boolean} `true` if this is plainer graph
	 */
	isPlainerAddVertex() {
		const structure = new Graph(this._nodes.length)
		for (const e of this._edges) {
			structure.addEdge(e[0], e[1], 1, e.direct)
		}
		const articulations = this.articulations()
		for (let i = articulations.length - 1; i >= 0; i--) {
			structure.removeNode(articulations[i])
		}
		const components = structure.components()
		return components.every(comp => {
			const sg = structure.inducedSub(comp)
			const n = sg._nodes.length
			const alist = sg.adjacencyList()
			for (let i = 0; i < n; i++) {
				const j = alist[i].indexOf(i)
				if (j >= 0) alist[i].splice(j, 1)
			}

			const g = sg._stNumbering()

			const gidx = g.map((v, i) => [v, i])
			gidx.sort((a, b) => a[0] - b[0])
			const order = gidx.map(v => v[1])

			const root = { type: 'p', children: alist[order[0]].map(v => ({ value: v })) }
			root.children.forEach(n => (n.parent = root))
			const bubble = (tree, set) => {
				let blockCount = 0
				let offTheTop = 0
				const queue = []
				const nodes = [tree]
				while (nodes.length > 0) {
					const node = nodes.pop()
					if (node.children && node.children.length > 0) {
						nodes.push(...node.children)
					} else if (set.indexOf(node.value) >= 0) {
						queue.push(node)
					}
				}
				while (queue.length + blockCount + offTheTop > 1) {
					if (queue.length === 0) {
						return false
					}
					const x = queue.shift()
					x.mark = 'blocked'
					const xidx = x.parent?.children.indexOf(x) ?? null
					const imsib = []
					if (xidx !== null && x.parent.type === 'q') {
						if (xidx > 0) {
							imsib.push(x.parent.children[xidx - 1])
						}
						if (xidx < x.parent.children.length - 1) {
							imsib.push(x.parent.children[xidx + 1])
						}
					}
					const bs = imsib.filter(y => y.mark === 'blocked')
					const us = imsib.filter(y => y.mark === 'unblocked')
					if (us.length > 0 || imsib.length < 2) {
						x.mark = 'unblocked'
					}
					if (x.mark === 'unblocked') {
						const y = x.parent
						if (bs.length > 0) {
							for (let i = xidx - 1; i >= 0; i--) {
								if (y.children[i].mark !== 'blocked') {
									break
								}
								y.children[i].mark = 'unblocked'
								y.pertinentChildCount = (y.pertinentChildCount ?? 0) + 1
							}
							for (let i = xidx + 1; i < y.children.length; i++) {
								if (y.children[i].mark !== 'blocked') {
									break
								}
								y.children[i].mark = 'unblocked'
								y.pertinentChildCount = (y.pertinentChildCount ?? 0) + 1
							}
						}
						if (!y) {
							offTheTop = 1
						} else {
							y.pertinentChildCount = (y.pertinentChildCount ?? 0) + 1
							if (!y.mark) {
								y.mark = 'queued'
								queue.push(y)
							}
						}
						blockCount -= bs.length
					} else {
						blockCount += 1 - bs.length
					}
				}
				return true
			}
			const reduce = (tree, set) => {
				const queue = [tree]
				// let needCount = 0
				while (true) {
					const newQueue = []
					let changed = false
					for (let i = 0; i < queue.length; i++) {
						queue[i].label = null
						queue[i].pertinentLeafCount = 0
						if (queue[i].children && queue[i].children.length > 0) {
							newQueue.push(...queue[i].children)
							changed = true
						} else if (set.indexOf(queue[i].value) >= 0) {
							queue[i].pertinentLeafCount = 1
							newQueue.push(queue[i])
							// needCount++
						} else {
							queue[i].label = 'empty'
							// newQueue.push(queue[i])
						}
					}
					queue.splice(0, queue.length, ...newQueue)
					if (!changed) break
				}
				const needCount = queue.length
				while (queue.length > 0) {
					const x = queue.shift()
					if (x.parent) {
						x.parent.pertinentLeafCount += x.pertinentLeafCount
					}
					if (!x.children || x.children.length === 0) {
						x.label = set.indexOf(x.value) >= 0 ? 'full' : 'empty'
					} else {
						const cempty = []
						const cfull = []
						const cpartial = []
						for (let i = 0; i < x.children.length; i++) {
							if (x.children[i].label === 'empty') {
								cempty.push(x.children[i])
							} else if (x.children[i].label === 'full') {
								cfull.push(x.children[i])
							} else {
								cpartial.push(x.children[i])
							}
						}
						if (cempty.length === x.children.length) {
							x.label = 'empty'
						} else if (cfull.length === x.children.length) {
							x.label = 'full'
						} else if (x.type === 'p') {
							if (cempty.length + cfull.length === x.children.length) {
								if (x.pertinentLeafCount === needCount) {
									x.children = cempty
									const c = { type: 'p', children: cfull, label: 'full', parent: x }
									c.children.forEach(n => (n.parent = c))
									x.children.push(c)
								} else {
									x.type = 'q'
									x.children = []
									if (cempty.length === 1) {
										x.children.push(cempty[0])
									} else {
										const c = { type: 'p', children: cempty, label: 'empty', parent: x }
										c.children.forEach(n => (n.parent = c))
										x.children.push(c)
									}
									if (cfull.length === 1) {
										x.children.push(cfull[0])
									} else {
										const c = { type: 'p', children: cfull, label: 'full', parent: x }
										c.children.forEach(n => (n.parent = c))
										x.children.push(c)
									}
									x.label = 'partial'
								}
							} else {
								if (x.pertinentLeafCount === needCount) {
									x.children = cempty
									if (cpartial.length === 1) {
										x.children.push(cpartial[0])
										if (cfull.length > 0) {
											cpartial[0].children.push({ type: 'p', children: cfull, label: 'full' })
											cpartial[0].children.forEach(n => (n.parent = cpartial[0]))
										}
									} else if (cpartial.length === 2) {
										const c = { type: 'q', children: [], label: 'partial' }
										c.children.push(...cpartial[0].children)
										c.children.push(...cfull)
										c.children.push(...cpartial[1].children.reverse())
										c.children.forEach(n => (n.parent = c))
										x.children.push(c)
									} else {
										return false
									}
								} else if (cpartial.length === 1) {
									x.type = 'q'
									x.children = []
									if (cempty.length > 0) {
										const c = { type: 'p', children: cempty, label: 'empty' }
										c.children.forEach(n => (n.parent = c))
										x.children.push(c)
									}
									x.children.push(...cpartial[0].children)
									if (cfull.length > 0) {
										const c = { type: 'p', children: cfull, label: 'full' }
										c.children.forEach(n => (n.parent = c))
										x.children.push(c)
									}
									x.label = 'partial'
								} else {
									return false
								}
							}
						} else if (x.type === 'q') {
							if (x.children[0].label === 'full') {
								x.children.reverse()
							}
							if (cpartial.length === 0) {
								let reqState = 'empty'
								for (let i = 0; i < x.children.length; i++) {
									if (x.children[i].label === 'full') {
										reqState = 'full'
									} else if (x.children[i].label !== reqState) {
										return false
									}
								}
								x.label = 'partial'
							} else if (cpartial.length === 1) {
								let reqState = 'empty'
								for (let i = 0; i < x.children.length; i++) {
									if (x.children[i].label === 'partial') {
										reqState = 'full'
									} else if (x.children[i].label !== reqState) {
										return false
									}
								}
								x.children = cempty
								x.children.push(...cpartial[0].children)
								x.children.push(...cfull)
								x.children.forEach(n => (n.parent = x))
								x.label = 'partial'
							} else if (cpartial.length === 2 && x.pertinentLeafCount === needCount) {
								let reqState = 'empty'
								for (let i = 0; i < x.children.length; i++) {
									if (x.children[i].label === 'partial') {
										reqState = reqState === 'empty' ? 'full' : 'empty'
									} else if (x.children[i].label !== reqState) {
										return false
									}
								}
								x.children = cempty
								x.children.push(...cpartial[0].children)
								x.children.push(...cfull)
								x.children.push(...cpartial[1].children.reverse())
								x.children.forEach(n => (n.parent = x))
								x.label = 'partial'
							} else {
								return false
							}
						}
					}
					if (x.pertinentLeafCount === needCount) {
						break
					} else if (x.parent) {
						x.parent.pertinentChildCount -= 1
						if (x.parent.pertinentChildCount === 0) {
							// if (x.parent.children.every(y => y.label)) {
							queue.push(x.parent)
						}
					}
				}
				return true
			}
			const getRoot = (tree, set) => {
				const stack = []
				const nodes = [tree]
				while (nodes.length > 0) {
					const node = nodes.pop()
					if (node.children && node.children.length > 0) {
						node.pertinentLeafCount = 0
						nodes.push(...node.children)
					} else if (set.indexOf(node.value) >= 0) {
						node.pertinentLeafCount = 1
						stack.push(node)
					}
				}
				const needCount = stack.length
				while (stack.length > 0) {
					const node = stack.pop()
					if (node.pertinentLeafCount === needCount) {
						return node
					}
					const parent = node.parent
					if (parent) {
						parent.pertinentLeafCount++
						stack.push(parent)
					}
				}
				return tree
			}

			const applyParent = tree => {
				const stk = [tree]
				while (stk.length > 0) {
					const node = stk.shift()
					if (node.children) {
						for (let i = 0; i < node.children.length; i++) {
							node.children[i].parent = node
							stk.push(node.children[i])
						}
					}
				}
			}
			const printTree = tree => {
				const stk2 = [tree]
				while (stk2.length > 0) {
					const node = stk2.shift()
					node.parent = undefined
					if (node.children) {
						stk2.push(...node.children)
					}
				}
				console.log(JSON.stringify(tree, null, '  '))
				applyParent(tree)
			}

			for (let k = 1; k < n; k++) {
				const f1 = bubble(root, [order[k]])
				const f2 = reduce(root, [order[k]])
				if (!f1 || !f2) {
					return false
				}
				const rt = getRoot(root, [order[k]])
				const newc = []
				for (let i = 0; i < alist[order[k]].length; i++) {
					if (order.indexOf(alist[order[k]][i]) > k) {
						newc.push({ value: alist[order[k]][i] })
					}
				}
				if (rt.type === 'q') {
					const newChildren = []
					let added = false
					for (let i = 0; i < rt.children.length; i++) {
						if (rt.children[i].label === 'full') {
							if (!added) {
								newChildren.push(...newc)
								added = true
							}
						} else {
							newChildren.push(rt.children[i])
						}
					}
					rt.children = newChildren
					if (rt.children.length === 2) {
						rt.type = 'p'
					}
				} else {
					rt.type = 'p'
					rt.value = undefined
					rt.children = newc
				}
				rt.children.forEach(n => (n.parent = rt))
			}

			return true
		})
	}

	_stNumbering(s = 0, t = null) {
		const n = this._nodes.length
		const alist = this.adjacencyList()
		for (let i = 0; i < n; i++) {
			const j = alist[i].indexOf(i)
			if (j >= 0) alist[i].splice(j, 1)
		}
		t ??= alist[s][0]

		const nodeState = Array(n).fill('new')
		const dfn = Array(n).fill(Infinity)
		const parent = Array(n).fill(-1)
		const low = Array(n).fill(Infinity)
		const edges = []
		let count = 1
		const search = v => {
			nodeState[v] = 'old'
			dfn[v] = count++
			low[v] = dfn[v]
			for (const w of alist[v]) {
				if (nodeState[w] === 'new') {
					edges.push([v, w, 'tree'])
					parent[w] = v
					search(w)
					low[v] = Math.min(low[v], low[w])
				} else if (parent[v] !== w) {
					edges.push([v, w, 'back'])
					low[v] = Math.min(low[v], dfn[w])
				}
			}
		}
		search(t)

		const stack = [t, s]
		const g = []
		nodeState.fill('new')
		const edgeState = Array(edges.length).fill('new')
		edgeState[0] = 'old'
		let i = 1
		while (stack.length > 0) {
			const v = stack.pop()
			if (v === t) {
				g[t] = i
				break
			}
			const path = []
			for (let j = 0; j < edges.length; j++) {
				if (edgeState[j] !== 'new') {
					continue
				}
				const e = edges[j]
				if (e[0] === v && e[2] === 'back') {
					edgeState[j] = 'old'
					path.push(v, e[1])
					break
				} else if (e[0] === v && e[2] === 'tree') {
					let w = e[1]
					path.push(v, w)
					const loww = low[w]
					edgeState[j] = nodeState[w] = nodeState[v] = 'old'
					while (w >= 0) {
						for (let k = 0; k < edges.length; k++) {
							if (edges[k][0] === w && edges[k][2] === 'back' && dfn[edges[k][1]] === loww) {
								w = edges[k][1]
								path.push(w)
								nodeState[w] = edgeState[k] = 'old'
								w = -1
								break
							} else if (edges[k][0] === w && edges[k][2] === 'tree') {
								w = edges[k][1]
								path.push(w)
								nodeState[w] = edgeState[k] = 'old'
								break
							}
						}
					}
					break
				} else if (e[1] === v && e[2] === 'back') {
					let w = e[0]
					path.push(v, w)
					nodeState[v] = edgeState[j] = 'old'
					while (nodeState[w] !== 'old') {
						nodeState[w] = 'old'
						for (let k = 0; k < edges.length; k++) {
							if (edges[k][1] === w && edges[k][2] === 'tree') {
								w = edges[k][0]
								path.push(w)
								edgeState[k] = 'old'
								break
							}
						}
					}
					break
				}
			}
			if (path.length === 0) {
				g[v] = i++
			} else {
				for (let k = path.length - 2; k >= 0; k--) {
					stack.push(path[k])
				}
			}
		}

		return g
	}

	/**
	 * Returns if this is symmetric graph or not.
	 *
	 * @returns {boolean} `true` if this is symmetric graph
	 */
	isSymmetric() {
		if (this._nodes.length <= 1) {
			return true
		}
		throw new GraphException('Not implemented')
	}

	/**
	 * Returns if this is directed acyclic graph or not.
	 *
	 * @returns {boolean} `true` if this is directed acyclic graph
	 */
	isDAG() {
		return this.isDirected() && !this.hasCycle()
	}

	/**
	 * Returns if this is separable graph or not.
	 *
	 * @returns {boolean} `true` if this is separable graph
	 */
	isSeparable() {
		return !this.isBiconnected()
	}

	/**
	 * Returns if this has cycle or not.
	 *
	 * @returns {boolean} `true` if this has cycle
	 */
	hasCycle() {
		if (this.isUndirected()) {
			return this.hasCycleDFS()
		}
		return this.hasCycleEachNodes()
	}

	/**
	 * Returns if this has cycle or not with depth-first search.
	 *
	 * @returns {boolean} `true` if this has cycle
	 */
	hasCycleDFS() {
		if (!this.isUndirected()) {
			throw new GraphException('This method only works undirected graph.')
		}
		const con = Array(this._nodes.length).fill(false)
		const use = Array(this._edges.length).fill(false)
		const stack = [0]
		while (stack.length > 0 || con.some(v => !v)) {
			const i = stack.length > 0 ? stack.pop() : con.indexOf(false)
			if (con[i]) {
				return true
			}
			con[i] = true
			for (let k = 0; k < this._edges.length; k++) {
				if (use[k]) {
					continue
				}
				const e = this._edges[k]
				if (e[0] === i) {
					if (con[e[1]]) {
						return true
					}
					use[k] = true
					stack.push(e[1])
				}
				if (!e.direct && e[1] === i) {
					if (con[e[0]]) {
						return true
					}
					use[k] = true
					stack.push(e[0])
				}
			}
		}
		return false
	}

	/**
	 * Returns if this has cycle or not with checking each node.
	 *
	 * @returns {boolean} `true` if this has cycle
	 */
	hasCycleEachNodes() {
		for (let s = 0; s < this._nodes.length; s++) {
			const stack = [[[s], Array(this._edges.length).fill(false)]]
			while (stack.length > 0) {
				const [path, used] = stack.pop()
				const i = path[path.length - 1]
				for (let k = 0; k < this._edges.length; k++) {
					if (used[k]) {
						continue
					}
					const e = this._edges[k]
					if (e[0] === i) {
						if (e[1] === s) {
							return true
						} else if (path.indexOf(e[1]) >= 0) {
							continue
						}
						const u = used.concat()
						u[k] = true
						stack.push([path.concat(e[1]), u])
					}
					if (!e.direct && e[1] === i) {
						if (e[0] === s) {
							return true
						} else if (path.indexOf(e[1]) >= 0) {
							continue
						}
						const u = used.concat()
						u[k] = true
						stack.push([path.concat(e[0]), u])
					}
				}
			}
		}
		return false
	}

	/**
	 * Returns `true` if an isomorphism exists between this graph and `g`.
	 *
	 * @param {Graph} g Other graph
	 * @returns {boolean} `true` if an isomorphism exists between this graph and `g`
	 */
	isomorphism(g) {
		if (g === this) {
			return true
		}
		if (this._nodes.length !== g._nodes.length || this._edges.length !== g._edges.length) {
			return false
		}
		if (this._nodes.length === 0 || this._edges.length === 0) {
			return true
		}
		throw new GraphException('Not implemented')
	}

	/**
	 * Returns induced sub graph.
	 *
	 * @param {number[]} k Selected indexes
	 * @returns {Graph} Induced sub graph
	 */
	inducedSub(k) {
		const edges = []
		for (const e of this._edges) {
			const i0 = k.indexOf(e[0])
			const i1 = k.indexOf(e[1])
			if (i0 >= 0 && i1 >= 0) {
				edges.push(new Edge(i0, i1, e.value0, e.direct))
			}
		}
		const nodes = k.map(i => this._nodes[i])
		return new Graph(nodes, edges)
	}

	/**
	 * Returns complement graph.
	 *
	 * @returns {Graph} Complement graph
	 */
	complement() {
		if (this._nodes.length === 0) {
			return new Graph(0)
		}
		const edges = []
		for (let i = 0; i < this._nodes.length; i++) {
			for (let j = 0; j < i; j++) {
				if (this.getEdges(i, j).length === 0) {
					edges.push(new Edge(j, i))
				}
			}
		}
		return new Graph(this._nodes.concat(), edges)
	}

	/**
	 * Contract this graph.
	 *
	 * @param {number} a Index of node
	 * @param {number} b Index of node
	 */
	contraction(a, b) {
		if (a === b) {
			return
		} else if (b < a) {
			;[a, b] = [b, a]
		}
		this._nodes.splice(b, 1)
		for (let i = this._edges.length - 1; i >= 0; i--) {
			const e = this._edges[i]
			if ((e[0] === a && e[1] === b) || (e[1] === a && e[0] === b)) {
				this._edges.splice(i, 1)
			} else {
				if (e[0] === b) {
					e[0] = a
				} else if (e[0] > a) {
					e[0]--
				}
				if (e[1] === b) {
					e[1] = a
				} else if (e[1] > a) {
					e[1]--
				}
			}
		}
	}

	/**
	 * Subdivision this graph.
	 *
	 * @param {number} a Index of node
	 * @param {number} b Index of node
	 */
	subdivision(a, b) {
		this._nodes.push(null)
		const k = this._nodes.length - 1
		for (let i = this._edges.length - 1; i >= 0; i--) {
			const e = this._edges[i]
			if ((e[0] === a && e[1] === b) || (e[1] === a && e[0] === b)) {
				this._edges.splice(i, 1)
				this._edges.push(new Edge(e[0], k, e.value0, e.direct))
				this._edges.push(new Edge(k, e[0], e.value0, e.direct))
			}
		}
	}

	/**
	 * Take the disjoint union of this graph and other graph.
	 *
	 * @param {Graph} g Other graph
	 */
	disjointUnion(g) {
		const n = this._nodes.length
		this._nodes = this._nodes.concat(g._nodes)
		for (const e of g._edges) {
			this._edges.push(new Edge(e[0] + n, e[1] + n, e.value0, e.direct))
		}
	}

	/**
	 * Substitute other graph at the node.
	 *
	 * @param {number} k Index of the node
	 * @param {Graph} g Other graph
	 */
	substitution(k, g) {
		if (g._nodes.length === 0) {
			this.removeNode(k)
		} else if (g._nodes.length === 1) {
			for (const e of g._edges) {
				this._edges.push(new Edge(e[0] + k, e[1] + k, e.value0, e.direct))
			}
		} else {
			const n = this._nodes.length
			this._nodes[k] = g._nodes[0]
			this._nodes = this._nodes.concat(g._nodes.slice(1))
			for (const e of this._edges) {
				if (e[0] === k || e[1] === k) {
					for (let i = 0; i < g._nodes.length - 1; i++) {
						this._edges.push(
							new Edge(e[0] === k ? n + i : e[0], e[1] === k ? n + i : e[1], e.value0, e.direct)
						)
					}
				}
			}
			for (const e of g._edges) {
				this._edges.push(
					new Edge(e[0] === 0 ? k : e[0] + n - 1, e[1] === 0 ? k : e[1] + n - 1, e.value0, e.direct)
				)
			}
		}
	}

	/**
	 * Take the cartesian product of this graph and other graph.
	 *
	 * @param {Graph} g Other graph
	 * @returns {Graph} Cartesian producted graph
	 */
	cartesianProduct(g) {
		const n1 = this._nodes.length
		const n2 = g._nodes.length
		const nodes = []
		for (let i = 0; i < n1; i++) {
			for (let j = 0; j < n2; j++) {
				if (this._nodes[i] != null || g._nodes[j] != null) {
					nodes.push([this._nodes[i], this._nodes[j]])
				} else {
					nodes.push(null)
				}
			}
		}
		const edges = []
		for (const e of this._edges) {
			for (let i = 0; i < n2; i++) {
				edges.push(new Edge(e[0] + n1 * i, e[1] + n1 * i, e.value0, e.direct))
			}
		}
		for (const e of g._edges) {
			for (let i = 0; i < n1; i++) {
				edges.push(new Edge(i + e[0] * n1, i + e[1] * n1, e.value0, e.direct))
			}
		}
		return new Graph(nodes, edges)
	}

	/**
	 * Take the tensor product of this graph and other graph.
	 *
	 * @param {Graph} g Other graph
	 * @returns {Graph} Tensor producted graph
	 */
	tensorProduct(g) {
		const n1 = this._nodes.length
		const n2 = g._nodes.length
		const nodes = []
		for (let i = 0; i < n1; i++) {
			for (let j = 0; j < n2; j++) {
				if (this._nodes[i] != null || g._nodes[j] != null) {
					nodes.push([this._nodes[i], this._nodes[j]])
				} else {
					nodes.push(null)
				}
			}
		}
		const edges = []
		for (const e1 of this._edges) {
			for (const e2 of g._edges) {
				if (e1.direct === e2.direct) {
					edges.push(
						new Edge(
							e1[0] + e2[0] * n1,
							e1[1] + e2[1] * n1,
							e1.weighted || e2.weighted ? [e1.value0, e2.value0] : null,
							e1.direct
						)
					)
					if (!e1.direct) {
						edges.push(
							new Edge(
								e1[1] + e2[0] * n1,
								e1[0] + e2[1] * n1,
								e1.weighted || e2.weighted ? [e1.value0, e2.value0] : null,
								e1.direct
							)
						)
					}
				}
			}
		}
		return new Graph(nodes, edges)
	}

	/**
	 * Take the strong product of this graph and other graph.
	 *
	 * @param {Graph} g Other graph
	 * @returns {Graph} Strong producted graph
	 */
	strongProduct(g) {
		const n1 = this._nodes.length
		const n2 = g._nodes.length
		const nodes = []
		for (let i = 0; i < n1; i++) {
			for (let j = 0; j < n2; j++) {
				if (this._nodes[i] != null || g._nodes[j] != null) {
					nodes.push([this._nodes[i], this._nodes[j]])
				} else {
					nodes.push(null)
				}
			}
		}
		const edges = []
		for (const e of this._edges) {
			for (let i = 0; i < n2; i++) {
				edges.push(new Edge(e[0] + n1 * i, e[1] + n1 * i, e.value0, e.direct))
			}
		}
		for (const e of g._edges) {
			for (let i = 0; i < n1; i++) {
				edges.push(new Edge(i + e[0] * n1, i + e[1] * n1, e.value0, e.direct))
			}
		}
		for (const e1 of this._edges) {
			for (const e2 of g._edges) {
				if (e1.direct === e2.direct) {
					edges.push(
						new Edge(
							e1[0] + e2[0] * n1,
							e1[1] + e2[1] * n1,
							e1.weighted || e2.weighted ? [e1.value0, e2.value0] : null,
							e1.direct
						)
					)
					if (!e1.direct) {
						edges.push(
							new Edge(
								e1[1] + e2[0] * n1,
								e1[0] + e2[1] * n1,
								e1.weighted || e2.weighted ? [e1.value0, e2.value0] : null,
								e1.direct
							)
						)
					}
				}
			}
		}
		return new Graph(nodes, edges)
	}

	/**
	 * Take the lexicographic product of this graph and other graph.
	 *
	 * @param {Graph} g Other graph
	 * @returns {Graph} Lexicographic producted graph
	 */
	lexicographicProduct(g) {
		const n1 = this._nodes.length
		const n2 = g._nodes.length
		const nodes = []
		for (let i = 0; i < n1; i++) {
			for (let j = 0; j < n2; j++) {
				if (this._nodes[i] != null || g._nodes[j] != null) {
					nodes.push([this._nodes[i], this._nodes[j]])
				} else {
					nodes.push(null)
				}
			}
		}
		const edges = []
		for (const e of this._edges) {
			for (let i = 0; i < n2; i++) {
				for (let j = 0; j < n2; j++) {
					edges.push(new Edge(e[0] + n1 * i, e[1] + n1 * j, e.value0, e.direct))
				}
			}
		}
		for (const e of g._edges) {
			for (let i = 0; i < n1; i++) {
				edges.push(new Edge(i + e[0] * n1, i + e[1] * n1, e.value0, e.direct))
			}
		}
		return new Graph(nodes, edges)
	}

	/**
	 * Returns shortest path.
	 *
	 * @param {number} [from] Index of start nodes
	 * @returns {{length: number, prev: number, path: number[]}[] | {length: number, path: number[]}[][]} Shortest length and path for all nodes
	 */
	shortestPath(from) {
		if (from == null) {
			return this.shortestPathFloydWarshall()
		} else {
			return this.shortestPathDijkstra(from)
		}
	}

	/**
	 * Returns shortest path with breadth first search algorithm.
	 *
	 * @param {number} from Index of start node
	 * @returns {{length: number, prev: number, path: number[]}[]} Shortest length and path for all nodes
	 */
	shortestPathBreadthFirstSearch(from) {
		const p = Array.from({ length: this._nodes.length }, () => ({ length: Infinity, prev: null, path: [] }))
		const stack = [[from, null]]
		p[from] = { length: 0, prev: null, path: [from] }
		const checked = Array(this._nodes.length).fill(false)
		while (stack.length > 0) {
			const [j, prev] = stack.shift()
			if (checked[j]) {
				continue
			}
			checked[j] = true
			if (prev != null) {
				p[j].prev = prev
				p[j].length = p[prev].length + 1
				p[j].path = p[prev].path.concat(j)
			}
			for (const e of this._edges) {
				if (e.value <= 0) {
					continue
				}
				if (e[0] === j && !checked[e[1]]) {
					stack.push([e[1], j])
				}
				if (!e.direct && e[1] === j && !checked[e[0]]) {
					stack.push([e[0], j])
				}
			}
		}
		return p
	}

	/**
	 * Returns shortest path with Dijkstra's algorithm.
	 *
	 * @param {number} from Index of start node
	 * @returns {{length: number, prev: number, path: number[]}[]} Shortest length and path for all nodes
	 */
	shortestPathDijkstra(from) {
		const p = Array.from({ length: this._nodes.length }, () => ({ length: Infinity, prev: null, path: [] }))
		const stack = [from]
		p[from] = { length: 0, prev: null, path: [from] }
		while (stack.length > 0) {
			const j = stack.shift()
			for (const e of this._edges) {
				if (e.value <= 0) {
					continue
				}
				if (e[0] === j && p[e[1]].length > p[j].length + e.value) {
					p[e[1]].length = p[j].length + e.value
					p[e[1]].prev = j
					p[e[1]].path = p[j].path.concat(e[1])
					stack.push(e[1])
				}
				if (!e.direct && e[1] === j && p[e[0]].length > p[j].length + e.value) {
					p[e[0]].length = p[j].length + e.value
					p[e[0]].prev = j
					p[e[0]].path = p[j].path.concat(e[0])
					stack.push(e[0])
				}
			}
		}
		return p
	}

	/**
	 * Returns shortest path with Bellman–Ford algorithm.
	 *
	 * @param {number} from Index of start node
	 * @returns {{length: number, prev: number, path: number[]}[]} Shortest length and path for all nodes
	 */
	shortestPathBellmanFord(from) {
		const p = Array.from({ length: this._nodes.length }, () => ({ length: Infinity, prev: null, path: [] }))
		p[from] = { length: 0, prev: null, path: [from] }
		for (let t = 0; t < this._nodes.length - 1; t++) {
			for (const e of this._edges) {
				if (p[e[1]].length > p[e[0]].length + e.value) {
					p[e[1]].length = p[e[0]].length + e.value
					p[e[1]].prev = e[0]
					p[e[1]].path = p[e[0]].path.concat(e[1])
				}
				if (!e.direct && p[e[0]].length > p[e[1]].length + e.value) {
					p[e[0]].length = p[e[1]].length + e.value
					p[e[0]].prev = e[1]
					p[e[0]].path = p[e[1]].path.concat(e[0])
				}
			}
		}
		return p
	}

	/**
	 * Returns shortest path with Floyd–Warshall algorithm.
	 *
	 * @returns {{length: number, path: number[]}[][]} Shortest length and path for all nodes
	 */
	shortestPathFloydWarshall() {
		const p = []
		for (let i = 0; i < this._nodes.length; i++) {
			p[i] = Array.from({ length: this._nodes.length }, () => ({ length: Infinity, path: [] }))
			p[i][i] = { length: 0, path: [i] }
		}
		for (const e of this._edges) {
			if (p[e[0]][e[1]].length > e.value) {
				p[e[0]][e[1]].length = e.value
				p[e[0]][e[1]].path = [e[0], e[1]]
			}
			if (!e.direct && p[e[1]][e[0]].length > e.value) {
				p[e[1]][e[0]].length = e.value
				p[e[1]][e[0]].path = [e[1], e[0]]
			}
		}
		for (let k = 0; k < this._nodes.length; k++) {
			for (let i = 0; i < this._nodes.length; i++) {
				for (let j = 0; j < this._nodes.length; j++) {
					if (p[i][j].length > p[i][k].length + p[k][j].length) {
						p[i][j].length = p[i][k].length + p[k][j].length
						p[i][j].path = p[i][k].path.concat(p[k][j].path.slice(1))
					}
				}
			}
		}
		return p
	}

	/**
	 * Returns minimum spanning tree.
	 *
	 * @returns {Graph} Minimum spanning tree
	 */
	minimumSpanningTree() {
		return this.minimumSpanningTreePrim()
	}

	/**
	 * Returns minimum spanning tree with Prim's algorithm.
	 *
	 * @returns {Graph} Minimum spanning tree
	 */
	minimumSpanningTreePrim() {
		const checked = Array(this._nodes.length).fill(false)
		checked[0] = true
		const es = this._edges.concat()
		const edges = []
		while (checked.some(v => !v)) {
			let min_w = Infinity
			let e = null
			for (let i = es.length - 1; i >= 0; i--) {
				if (checked[es[i][0]] && checked[es[i][1]]) {
					es.splice(i, 1)
				} else if (
					(checked[es[i][0]] && !checked[es[i][1]]) ||
					(!es[i].direct && checked[es[i][1]] && !checked[es[i][0]])
				) {
					if (min_w > es[i].value) {
						e = es[i]
						min_w = es[i].value
					}
				}
			}
			edges.push(e)
			checked[e[0]] = checked[e[1]] = true
		}
		return new Graph(this._nodes.length, edges)
	}

	/**
	 * Returns minimum spanning tree with Kruskal's algorithm.
	 *
	 * @returns {Graph} Minimum spanning tree
	 */
	minimumSpanningTreeKruskal() {
		const c = Array.from({ length: this._nodes.length }, (_, i) => i)
		const edges = []
		const es = this._edges.concat()
		es.sort((a, b) => a.value - b.value)
		for (let i = 0; i < es.length; i++) {
			const e = es[i]
			const c1 = c[e[1]]
			if (c[e[0]] === c1) {
				continue
			}
			edges.push(e)
			for (let j = 0; j < this._nodes.length; j++) {
				if (c[j] === c1) {
					c[j] = c[e[0]]
				}
			}
		}
		return new Graph(this._nodes.length, edges)
	}

	/**
	 * Returns minimum spanning tree with Borůvka's algorithm.
	 *
	 * @returns {Graph} Minimum spanning tree
	 */
	minimumSpanningTreeBoruvka() {
		const c = Array.from({ length: this._nodes.length }, (_, i) => i)
		const edges = new Set()
		for (let t = 0; t < this._nodes.length - 1; t++) {
			const mine = []
			for (const e of this._edges) {
				if (c[e[0]] === c[e[1]]) {
					continue
				}
				if (!mine[c[e[0]]] || mine[c[e[0]]].value > e.value) {
					mine[c[e[0]]] = e
				}
				if (!mine[c[e[1]]] || mine[c[e[1]]].value > e.value) {
					mine[c[e[1]]] = e
				}
			}
			if (mine.length === 0) {
				break
			}
			for (const e of mine) {
				edges.add(e)
				const c1 = c[e[1]]
				for (let i = 0; i < this._nodes.length; i++) {
					if (c[i] === c1) {
						c[i] = c[e[0]]
					}
				}
			}
		}
		return new Graph(this._nodes.length, [...edges])
	}

	/**
	 * Returns cut size.
	 *
	 * @param {number[]} s Subset
	 * @param {number[]} t Subset
	 * @returns {number} Cut size
	 */
	cut(s, t) {
		const amat = this.adjacencyMatrix()
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
		if (minv > Math.floor(this._nodes.length / 2)) {
			throw new Error(`Invalid minv. ${minv}, ${this._nodes.length}`)
		}
		if (this._nodes.length <= 6) {
			return this.mincutBruteForce(minv)
		}
		let [mincut, nodes] = this.mincutStoerWagner(minv)
		for (let i = 1; i < this._nodes.length && mincut !== Infinity; i++) {
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
		const amat = this.adjacencyMatrix()
		const cutFlg = Array(this._nodes.length).fill(false)
		let mincutnodes = null
		let mincut = Infinity
		do {
			const node1 = []
			const node2 = []
			for (let i = 0; i < this._nodes.length; i++) {
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
			for (let i = 0; i < this._nodes.length; i++) {
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
		const amat = this.adjacencyMatrix()
		const co = Array.from({ length: this._nodes.length }, (_, i) => [i])
		let mincutnodes = null
		let mincut = Infinity
		const weight = amat.map(v => v.concat())
		for (let i = 1; i < this._nodes.length; i++) {
			const w = weight[startnode].concat()
			let s = 0
			let t = startnode
			for (let k = 0; k < this._nodes.length - i; k++) {
				w[t] = -Infinity
				s = t
				let maxw = -Infinity
				for (let m = 0; m < w.length; m++) {
					if (w[m] > maxw) {
						maxw = w[m]
						t = m
					}
				}
				for (let m = 0; m < this._nodes.length; m++) {
					w[m] += weight[t][m]
				}
			}
			if (w[t] - weight[t][t] < mincut && co[t].length >= minv && this._nodes.length - co[t].length >= minv) {
				mincut = w[t] - weight[t][t]
				mincutnodes = co[t].concat()
			}
			co[s].push(...co[t])
			for (let j = 0; j < this._nodes.length; j++) {
				weight[j][s] = weight[s][j] += weight[t][j]
			}
			weight[startnode][t] = -Infinity
		}
		if (!mincutnodes) {
			return [mincut, [Array.from({ length: this._nodes.length }, (_, i) => i)]]
		}
		const mc = []
		for (let i = 0; i < this._nodes.length; i++) {
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
		const amat = this.adjacencyMatrix()
		let mincutnodes = null
		let mincut = Infinity
		if (trials == null) {
			trials = this._nodes.length ** 2 * Math.log(this._nodes.length)
		}
		const edges = []
		let edgeCounts = 0
		for (let i = 0; i < this._nodes.length; i++) {
			edges[i] = new Set()
			for (let j = 0; j < this._nodes.length; j++) {
				if (amat[i][j]) {
					edges[i].add(j)
					edgeCounts++
				}
			}
		}
		for (let t = 0; t < trials; t++) {
			const nodes = Array.from({ length: this._nodes.length }, (_, i) => [i])
			const g = amat.map(v => v.concat())
			const e = edges.map(v => new Set(v))
			let size = edgeCounts
			let u = 0
			for (let c = 0; c < this._nodes.length - 2 && size > 0; c++) {
				let p = Math.floor(Math.random() * size)
				for (u = 0; u < this._nodes.length && e[u].size <= p; u++) {
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
			return [mincut, [Array.from({ length: this._nodes.length }, (_, i) => i)]]
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
		const amat = this.adjacencyMatrix()
		const nodes = Array.from({ length: this._nodes.length }, (_, i) => [i])
		if (trials === null) {
			trials = Math.log(this._nodes.length) ** 2
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
				for (u = 0; u < this._nodes.length && e[u].size <= p; u++) {
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
		for (let i = 0; i < this._nodes.length; i++) {
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
