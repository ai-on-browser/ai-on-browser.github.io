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
	 * @param {unknown} [value] Value of the edge
	 * @param {boolean} [direct] `true` if the edge is direct
	 */
	constructor(from, to, value = null, direct = false) {
		this[0] = from
		this[1] = to
		this.value = value ?? 1
		this.direct = direct
		this.weighted = value != null
	}

	get from() {
		return this[0]
	}

	get to() {
		return this[1]
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
	 * @param {number | unknown[]} [nodes] Number of nodes or values of nodes
	 * @param {([number, number] | {0?: number, 1?: number, from?: number, to?: number, value?: unknown, direct?: boolean} | Edge)[]} [edges] Edges
	 */
	constructor(nodes = 0, edges = []) {
		if (Array.isArray(nodes)) {
			/** @private */
			this._nodes = nodes
		} else {
			this._nodes = Array(nodes)
		}
		/** @private */
		this._edges = edges.map(
			e => new Edge(e[0] | e.from, e[1] | e.to, e instanceof Edge ? e.value0 : e.value, e.direct)
		)
	}

	/**
	 * Returns graph from adjacency matrix.
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
	 * @param {number} n Size of the graph
	 * @param {boolean} [direct] Direct graph or not
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
	 * Returns windmill graph.
	 * @param {number} k Size of the sub complete graph
	 * @param {number} n Number of the sub complete graph
	 * @returns {Graph} Windmill graph
	 */
	static windmill(k, n) {
		if (k === 1) {
			return new Graph(1)
		}
		const e = []
		for (let i = 0; i < n; i++) {
			for (let s = 0; s < k; s++) {
				for (let t = 0; t < s; t++) {
					e.push([t === 0 ? 0 : i * (k - 1) + t, i * (k - 1) + s])
				}
			}
		}
		return new Graph(n * (k - 1) + 1, e)
	}

	/**
	 * Returns named graph
	 * @param {'balaban 10 cage' | 'bidiakis cube' | 'biggs smith' | 'brinkmann' | 'bull' | 'butterfly' | 'chvatal' | 'clebsch' | 'coxeter' | 'desargues' | 'diamond' | 'durer' | 'errera' | 'folkman' | 'foster' | 'franklin' | 'frucht' | 'goldner-harary' | 'golomb' | 'gray' | 'grotzsch' | 'harries' | 'heawood' | 'herschel' | 'hoffman' | 'holt' | 'kittell' | 'markstrom' | 'mcgee' | 'meredith' | 'mobius kantor' | 'moser spindle' | 'nauru' | 'pappus' | 'petersen' | 'poussin' | 'robertson' | 'shrikhande' | 'sousselier' | 'sylvester' | 'tutte' | 'tutte coxeter' | 'wagner' | 'wells'} name Name of the graph
	 * @returns {Graph} Named graph
	 */
	static fromName(name) {
		switch (name) {
			case 'balaban 10 cage': {
				const edges = []
				for (let i = 0; i < 10; i++) {
					edges.push([i * 2, ((i + 3) % 10) * 2 + 1])
					edges.push([i * 2 + 1, ((i + 3) % 10) * 2])
					edges.push([i * 2, i * 3 + 20])
					edges.push([i * 2 + 1, i * 3 + 22])
					edges.push([i * 3 + 20, i * 3 + 21])
					edges.push([i * 3 + 21, i * 3 + 22])
					if (i < 5) {
						edges.push([i * 3 + 21, (i + 5) * 3 + 21])
					}
					edges.push([i * 3 + 20, i * 2 + 50])
					edges.push([i * 3 + 22, i * 2 + 51])
					edges.push([i * 2 + 50, ((i + 1) % 10) * 2 + 50])
					edges.push([i * 2 + 51, ((i + 1) % 10) * 2 + 51])
				}
				return new Graph(70, edges)
			}
			case 'bidiakis cube': {
				const edges = []
				for (let i = 0; i < 12; i++) {
					edges.push([i, (i + 1) % 12])
				}
				edges.push([0, 8], [1, 7], [2, 6], [3, 11], [4, 10], [5, 9])
				return new Graph(12, edges)
			}
			case 'biggs smith': {
				const edges = []
				for (let i = 0; i < 17; i++) {
					edges.push([i, (i + 8) % 17])
					edges.push([i, i + 17])
					edges.push([i + 17, i + 51])
					edges.push([i + 17, i + 68])
					edges.push([i + 34, ((i + 4) % 17) + 34])
					edges.push([i + 34, i + 68])
					edges.push([i + 51, ((i + 2) % 17) + 51])
					edges.push([i + 68, i + 85])
					edges.push([i + 85, ((i + 1) % 17) + 85])
				}
				return new Graph(102, edges)
			}
			case 'brinkmann': {
				const edges = []
				for (let i = 0; i < 7; i++) {
					edges.push([i, (i + 3) % 7])
					edges.push([i, i + 7])
					edges.push([i, ((i + 5) % 7) + 7])
					edges.push([i + 7, i + 14])
					edges.push([i + 7, ((i + 1) % 7) + 14])
					edges.push([i + 14, ((i + 2) % 7) + 14])
				}
				return new Graph(21, edges)
			}
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
			case 'chvatal': {
				const edges = []
				for (let i = 0; i < 4; i++) {
					edges.push([i, (i + 1) % 4])
					edges.push([i, i * 2 + 4])
					edges.push([i, ((i * 2 + 7) % 8) + 4])
					edges.push([i * 2 + 4, i * 2 + 5])
					edges.push([i * 2 + 4, ((i * 2 + 3) % 8) + 4])
				}
				edges.push([4, 8], [5, 9], [6, 10], [7, 11])
				return new Graph(12, edges)
			}
			case 'clebsch': {
				const edges = []
				for (let i = 0; i < 8; i++) {
					edges.push([i, (i + 3) % 8])
					edges.push([i, i + 8])
					edges.push([i, ((i + 2) % 8) + 8])
					edges.push([i + 8, ((i + 1) % 8) + 8])
				}
				for (let i = 0; i < 4; i++) {
					edges.push([i, i + 4])
					edges.push([i + 8, i + 12])
				}
				return new Graph(16, edges)
			}
			case 'coxeter': {
				const edges = []
				for (let i = 0; i < 3; i++) {
					edges.push([0, i * 8 + 4])
					edges.push([i + 1, i * 8 + 8])
					edges.push([i + 1, ((i * 8 + 15) % 24) + 4])
					edges.push([i + 1, ((i * 8 + 22) % 24) + 4])
					edges.push([i * 8 + 5, ((i * 8 + 19) % 24) + 4])
					edges.push([i * 8 + 9, ((i * 8 + 18) % 24) + 4])
				}
				for (let i = 0; i < 24; i++) {
					edges.push([i + 4, ((i + 1) % 24) + 4])
				}
				return new Graph(28, edges)
			}
			case 'desargues': {
				const edges = []
				for (let i = 0; i < 10; i++) {
					edges.push([i, (i + 3) % 10])
					edges.push([i, i + 10])
					edges.push([i + 10, ((i + 1) % 10) + 10])
				}
				return new Graph(20, edges)
			}
			case 'diamond':
				return new Graph(4, [
					[0, 1],
					[0, 2],
					[1, 2],
					[1, 3],
					[2, 3],
				])
			case 'durer': {
				const edges = []
				for (let i = 0; i < 6; i++) {
					edges.push([i, (i + 1) % 6])
					edges.push([i, i + 6])
					edges.push([i + 6, ((i + 2) % 6) + 6])
				}
				return new Graph(12, edges)
			}
			case 'dyck': {
				const edges = []
				for (let i = 0; i < 32; i++) {
					edges.push([i, (i + 1) % 32])
				}
				for (let i = 0; i < 8; i++) {
					edges.push([i * 4, (i * 4 + 5) % 32])
					edges.push([i * 4 + 2, (i * 4 + 15) % 32])
				}
				return new Graph(32, edges)
			}
			case 'errera': {
				const edges = [
					[0, 1],
					[2, 3],
					[5, 6],
					[9, 10],
					[15, 16],
				]
				for (let i = 0; i < 2; i++) {
					edges.push([0, 11 + i])
					edges.push([0, 15 + i])
					edges.push([1, 5 + i])
					edges.push([1, 11 + i])
					edges.push([2, 5 + i])
					edges.push([2, 7 + i])
					edges.push([3, 7 + i])
					edges.push([3, 9 + i])
					edges.push([4, 9 + i])
					edges.push([4, 13 + i])
					edges.push([4, 15 + i])
					edges.push([5 + i, 7 + i])
					edges.push([5 + i, 11 + i])
					edges.push([5 + i, 13 + i])
					edges.push([7 + i, 9 + i])
					edges.push([7 + i, 13 + i])
					edges.push([9 + i, 13 + i])
					edges.push([11 + i, 13 + i])
					edges.push([11 + i, 15 + i])
					edges.push([13 + i, 15 + i])
				}
				return new Graph(17, edges)
			}
			case 'folkman': {
				const edges = []
				for (let i = 0; i < 5; i++) {
					for (let j = 0; j < 4; j++) {
						edges.push([i * 4 + j, i * 4 + ((j + 1) % 4)])
					}
				}
				for (let i = 0; i < 4; i++) {
					edges.push([i * 4 + 2, (i + 1) * 4 + 1])
					edges.push([i * 4 + 2, (i + 1) * 4 + 3])
				}
				for (let i = 0; i < 3; i++) {
					edges.push([i * 4, (i + 2) * 4 + 1])
					edges.push([i * 4, (i + 2) * 4 + 3])
				}
				edges.push([1, 12], [1, 18], [3, 12], [3, 18], [5, 16], [7, 16])
				return new Graph(20, edges)
			}
			case 'foster': {
				const edges = []
				for (let i = 0; i < 15; i++) {
					for (let j = 0; j < 6; j++) {
						edges.push([i * 6 + j, (i * 6 + j + 1) % 90])
					}
					edges.push([i * 6, ((i + 8) % 15) * 6 + 5])
					edges.push([i * 6 + 1, ((i + 1) % 15) * 6 + 4])
					edges.push([i * 6 + 2, ((i + 12) % 15) * 6 + 3])
				}
				return new Graph(90, edges)
			}
			case 'franklin': {
				const edges = []
				for (let i = 0; i < 12; i++) {
					edges.push([i, (i + 1) % 12])
				}
				edges.push([0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10])
				return new Graph(12, edges)
			}
			case 'frucht': {
				const edges = []
				for (let i = 0; i < 7; i++) {
					edges.push([i, (i + 1) % 7])
				}
				edges.push([0, 7], [1, 8], [2, 8], [3, 9], [4, 9], [5, 10], [6, 10], [7, 10], [7, 11], [8, 11], [9, 11])
				return new Graph(12, edges)
			}
			case 'goldner-harary': {
				const edges = []
				for (let i = 0; i < 4; i++) {
					edges.push([0, i + 1])
					edges.push([0, i + 5])
					edges.push([i + 1, i + 5])
					edges.push([i + 1, ((i + 3) % 4) + 5])
					edges.push([i + 5, ((i + 3) % 4) + 5])
				}
				edges.push([5, 9], [9, 7], [7, 10], [10, 5], [5, 7], [6, 9], [8, 10])
				return new Graph(11, edges)
			}
			case 'golomb': {
				const edges = []
				for (let i = 0; i < 6; i++) {
					edges.push([0, i + 1])
					edges.push([i + 1, ((i + 1) % 6) + 1])
				}
				for (let i = 0; i < 3; i++) {
					edges.push([i + 7, ((i + 1) % 3) + 7])
					edges.push([i * 2 + 1, i + 7])
				}
				return new Graph(10, edges)
			}
			case 'gray': {
				const edges = []
				for (let i = 0; i < 54; i++) {
					edges.push([i, (i + 1) % 54])
				}
				for (let i = 0; i < 9; i++) {
					edges.push([i * 6, ((i + 4) % 9) * 6 + 1])
					edges.push([i * 6 + 2, ((i + 2) % 9) * 6 + 3])
					edges.push([i * 6 + 4, ((i + 1) % 9) * 6 + 5])
				}
				return new Graph(54, edges)
			}
			case 'grotzsch': {
				const edges = []
				for (let i = 0; i < 5; i++) {
					edges.push([0, i + 1])
					edges.push([i + 1, i + 6])
					edges.push([i + 6, ((i + 4) % 5) + 1])
					edges.push([i + 6, ((i + 2) % 5) + 6])
				}
				return new Graph(11, edges)
			}
			case 'harries': {
				const edges = []
				for (let i = 0; i < 10; i++) {
					edges.push([i, (i + 3) % 10])
					edges.push([i, i * 5 + 20])
					if (i % 2 === 0) {
						edges.push([i + 10, ((i + 1) % 10) + 10])
						edges.push([i + 10, i * 5 + 22])
					} else {
						edges.push([i + 10, ((i + 3) % 10) + 10])
						edges.push([i + 10, i * 5 + 24])
					}
				}
				for (let i = 0; i < 50; i++) {
					edges.push([i + 20, ((i + 1) % 50) + 20])
				}
				for (let i = 0; i < 5; i++) {
					edges.push([i * 10 + 24, ((i * 10 + 13) % 50) + 20])
					edges.push([i * 10 + 28, ((i * 10 + 17) % 50) + 20])
					edges.push([i * 5 + 21, ((i * 5 + 25) % 50) + 21])
				}
				return new Graph(70, edges)
			}
			case 'heawood': {
				const edges = []
				for (let i = 0; i < 7; i++) {
					edges.push([i * 2, i * 2 + 1])
					edges.push([i * 2 + 1, (i * 2 + 2) % 14])
					edges.push([i * 2, (i * 2 + 5) % 14])
				}
				return new Graph(14, edges)
			}
			case 'herschel': {
				const edges = []
				for (let i = 0; i < 4; i++) {
					edges.push([0, i + 1])
					edges.push([i + 1, i + 5])
					edges.push([i + 1, ((i + 3) % 4) + 5])
				}
				edges.push([5, 9], [5, 10], [6, 9], [7, 9], [7, 10], [8, 10])
				return new Graph(11, edges)
			}
			case 'hoffman': {
				const edges = []
				for (let i = 0; i < 2; i++) {
					edges.push([0, 6 + i])
					edges.push([0, 10 + i])
					edges.push([1, 8 + i])
					edges.push([1, 10 + i])
					edges.push([2, 6 + i])
					edges.push([2, 14 + i])
					edges.push([3, 8 + i])
					edges.push([3, 14 + i])
					edges.push([4 + i, 6 + i])
					edges.push([4 + i, 10 + i])
					edges.push([4 + i, 9 - i])
					edges.push([4 + i, 15 - i])
					edges.push([6 + i, 12 + i])
					edges.push([8 + i, 12 + i])
					edges.push([10 + i, 12 + i])
					edges.push([12 + i, 14 + i])
				}
				return new Graph(16, edges)
			}
			case 'holt': {
				const edges = []
				for (let i = 0; i < 9; i++) {
					edges.push([i, (i + 4) % 9])
					edges.push([i, ((i + 7) % 9) + 9])
					edges.push([i, ((i + 1) % 9) + 18])
					edges.push([i + 9, ((i + 1) % 9) + 9])
					edges.push([i + 9, i + 18])
					edges.push([i + 18, ((i + 2) % 9) + 18])
				}
				return new Graph(27, edges)
			}
			case 'kittell':
				return new Graph(23, [
					[0, 1],
					[0, 2],
					[0, 3],
					[0, 4],
					[0, 15],
					[0, 16],
					[1, 2],
					[1, 4],
					[1, 5],
					[1, 6],
					[1, 7],
					[1, 12],
					[2, 3],
					[2, 7],
					[2, 8],
					[3, 8],
					[3, 14],
					[3, 15],
					[4, 5],
					[4, 9],
					[4, 16],
					[4, 17],
					[5, 6],
					[5, 9],
					[5, 10],
					[6, 10],
					[6, 11],
					[6, 12],
					[7, 8],
					[7, 12],
					[7, 13],
					[8, 13],
					[8, 14],
					[9, 10],
					[9, 17],
					[9, 18],
					[10, 11],
					[10, 18],
					[10, 19],
					[11, 12],
					[11, 19],
					[11, 20],
					[12, 13],
					[12, 20],
					[12, 21],
					[13, 14],
					[13, 21],
					[14, 15],
					[14, 21],
					[15, 16],
					[15, 21],
					[16, 17],
					[16, 21],
					[16, 22],
					[17, 18],
					[17, 22],
					[18, 19],
					[18, 22],
					[19, 20],
					[19, 22],
					[20, 21],
					[20, 22],
					[21, 22],
				])
			case 'markstrom': {
				const edges = []
				for (let i = 0; i < 3; i++) {
					edges.push([i * 8, i * 8 + 1])
					edges.push([i * 8, i * 8 + 4])
					edges.push([i * 8 + 1, i * 8 + 2])
					edges.push([i * 8 + 1, i * 8 + 3])
					edges.push([i * 8 + 2, i * 8 + 3])
					edges.push([i * 8 + 2, ((i + 1) % 3) * 8])
					edges.push([i * 8 + 3, i * 8 + 5])
					edges.push([i * 8 + 4, i * 8 + 5])
					edges.push([i * 8 + 4, i * 8 + 6])
					edges.push([i * 8 + 5, i * 8 + 6])
					edges.push([i * 8 + 6, i * 8 + 7])
					edges.push([i * 8 + 7, ((i + 1) % 3) * 8 + 7])
				}
				return new Graph(24, edges)
			}
			case 'mcgee': {
				const edges = []
				for (let i = 0; i < 24; i++) {
					edges.push([i, (i + 1) % 24])
				}
				for (let i = 0; i < 8; i++) {
					edges.push([i * 3 + 1, (i * 3 + 8) % 24])
				}
				for (let i = 0; i < 4; i++) {
					edges.push([i * 3, i * 3 + 12])
				}
				return new Graph(24, edges)
			}
			case 'meredith': {
				const edges = []
				for (let i = 0; i < 5; i++) {
					for (let s = 0; s < 4; s++) {
						for (let t = 0; t < 3; t++) {
							edges.push([i * 14 + s, i * 14 + 4 + t])
							edges.push([i * 14 + 7 + s, i * 14 + 11 + t])
						}
					}
					edges.push([i * 14 + 1, i * 14 + 8])
					edges.push([i * 14 + 2, i * 14 + 9])
					edges.push([i * 14 + 3, ((i + 2) % 5) * 14])
					edges.push([i * 14 + 10, ((i + 1) % 5) * 14 + 7])
				}
				return new Graph(70, edges)
			}
			case 'mobius kantor': {
				const edges = []
				for (let i = 0; i < 8; i++) {
					edges.push([i, (i + 3) % 8])
					edges.push([i, i + 8])
					edges.push([i + 8, ((i + 1) % 8) + 8])
				}
				return new Graph(16, edges)
			}
			case 'moser spindle':
				return new Graph(7, [
					[0, 1],
					[0, 2],
					[0, 3],
					[0, 4],
					[1, 2],
					[1, 5],
					[2, 5],
					[3, 4],
					[3, 6],
					[4, 6],
					[5, 6],
				])
			case 'nauru': {
				const edges = []
				for (let i = 0; i < 24; i++) {
					edges.push([i, (i + 1) % 24])
				}
				for (let i = 0; i < 4; i++) {
					edges.push([i * 6, i * 6 + 5])
					edges.push([i * 6 + 2, (i * 6 + 9) % 24])
					edges.push([i * 6 + 1, (i * 6 + 16) % 24])
				}
				return new Graph(24, edges)
			}
			case 'pappus': {
				const edges = []
				for (let i = 0; i < 6; i++) {
					edges.push([i, ((i + 1) % 6) + 6])
					edges.push([i, ((i + 5) % 6) + 6])
					edges.push([i + 6, i + 12])
					edges.push([i + 12, ((i + 1) % 6) + 12])
				}
				edges.push([0, 3], [1, 4], [2, 5])
				return new Graph(18, edges)
			}
			case 'petersen': {
				const edges = []
				for (let i = 0; i < 5; i++) {
					edges.push([i, (i + 1) % 5])
					edges.push([i, i + 5])
					edges.push([i + 5, ((i + 2) % 5) + 5])
				}
				return new Graph(10, edges)
			}
			case 'poussin': {
				const edges = [
					[0, 1],
					[1, 2],
					[3, 4],
					[5, 6],
					[13, 14],
				]
				for (let i = 0; i < 2; i++) {
					edges.push([0, 7 + i])
					edges.push([0, 13 + i])
					edges.push([1, 7 + i])
					edges.push([1, 9 + i])
					edges.push([2, 5 + i])
					edges.push([2, 9 + i])
					edges.push([3, 5 + i])
					edges.push([3, 11 + i])
					edges.push([4, 11 + i])
					edges.push([4, 13 + i])
					edges.push([5 + i, 9 + i])
					edges.push([5 + i, 11 + i])
					edges.push([7 + i, 9 + i])
					edges.push([7 + i, 13 + i])
					edges.push([9 + i, 13 + i])
					edges.push([9 + i, 11 + i])
					edges.push([11 + i, 13 + i])
				}
				return new Graph(15, edges)
			}
			case 'robertson': {
				const edges = [
					[0, 2],
					[1, 3],
				]
				for (let i = 0; i < 4; i++) {
					edges.push([i, i * 3 + 4])
					edges.push([(i + 3) % 4, i * 3 + 5])
					edges.push([(i + 2) % 4, i * 3 + 6])
					edges.push([i * 3 + 4, i * 3 + 5])
					edges.push([i * 3 + 5, i * 3 + 6])
					edges.push([i * 3 + 6, ((i + 1) % 4) * 3 + 4])
				}
				for (let i = 0; i < 3; i++) {
					for (let j = 0; j < 4; j++) {
						edges.push([i + 16, ((i * 4 + j * 3) % 12) + 4])
					}
				}
				return new Graph(19, edges)
			}
			case 'shrikhande': {
				const edges = []
				for (let i = 0; i < 4; i++) {
					edges.push([i * 4, ((i + 1) % 4) * 4])
					edges.push([i * 4, i * 4 + 1])
					edges.push([i * 4, i * 4 + 2])
					edges.push([i * 4, ((i + 1) % 4) * 4 + 1])
					edges.push([i * 4, ((i + 1) % 4) * 4 + 2])
					edges.push([i * 4 + 1, ((i + 1) % 4) * 4 + 2])
					edges.push([i * 4 + 1, i * 4 + 3])
					edges.push([i * 4 + 2, ((i + 1) % 4) * 4 + 1])
					edges.push([i * 4 + 2, ((i + 1) % 4) * 4 + 3])
					edges.push([i * 4 + 2, ((i + 2) % 4) * 4 + 3])
					edges.push([i * 4 + 3, ((i + 1) % 4) * 4 + 1])
					edges.push([i * 4 + 3, ((i + 1) % 4) * 4 + 3])
				}
				return new Graph(16, edges)
			}
			case 'sousselier': {
				const edges = []
				for (let i = 0; i < 5; i++) {
					edges.push([0, i * 3 + 1])
					edges.push([i * 3 + 2, ((i * 3 + 5) % 15) + 1])
				}
				for (let i = 0; i < 15; i++) {
					edges.push([i + 1, ((i + 1) % 15) + 1])
				}
				edges.push([2, 12], [5, 15])
				return new Graph(16, edges)
			}
			case 'sylvester': {
				const edges = []
				for (let i = 0; i < 6; i++) {
					edges.push([i * 6, i * 6 + 2])
					edges.push([i * 6, i * 6 + 5])
					edges.push([i * 6, ((i + 1) % 6) * 6 + 4])
					edges.push([i * 6, ((i + 3) % 6) * 6 + 1])
					edges.push([i * 6, ((i + 3) % 6) * 6 + 3])
					edges.push([i * 6 + 1, i * 6 + 2])
					edges.push([i * 6 + 1, ((i + 2) % 6) * 6 + 4])
					edges.push([i * 6 + 1, ((i + 3) % 6) * 6 + 4])
					edges.push([i * 6 + 1, ((i + 4) % 6) * 6 + 2])
					edges.push([i * 6 + 2, ((i + 1) % 6) * 6 + 5])
					edges.push([i * 6 + 2, ((i + 2) % 6) * 6 + 5])
					edges.push([i * 6 + 3, i * 6 + 4])
					edges.push([i * 6 + 3, ((i + 1) % 6) * 6 + 3])
					edges.push([i * 6 + 3, ((i + 1) % 6) * 6 + 5])
					if (i < 3) {
						edges.push([i * 6 + 4, ((i + 3) % 6) * 6 + 4])
						edges.push([i * 6 + 5, ((i + 3) % 6) * 6 + 5])
					}
				}
				return new Graph(36, edges)
			}
			case 'tutte': {
				const edges = []
				for (let i = 0; i < 3; i++) {
					edges.push([0, i * 15 + 1])
					edges.push([i * 15 + 1, i * 15 + 2])
					edges.push([i * 15 + 1, i * 15 + 4])
					edges.push([i * 15 + 2, i * 15 + 3])
					edges.push([i * 15 + 2, i * 15 + 5])
					edges.push([i * 15 + 3, i * 15 + 4])
					edges.push([i * 15 + 3, i * 15 + 7])
					edges.push([i * 15 + 4, i * 15 + 9])
					edges.push([i * 15 + 5, i * 15 + 6])
					edges.push([i * 15 + 5, i * 15 + 10])
					edges.push([i * 15 + 6, i * 15 + 7])
					edges.push([i * 15 + 6, i * 15 + 11])
					edges.push([i * 15 + 7, i * 15 + 8])
					edges.push([i * 15 + 8, i * 15 + 9])
					edges.push([i * 15 + 8, i * 15 + 12])
					edges.push([i * 15 + 9, i * 15 + 15])
					edges.push([i * 15 + 10, i * 15 + 11])
					edges.push([i * 15 + 10, i * 15 + 13])
					edges.push([i * 15 + 11, i * 15 + 12])
					edges.push([i * 15 + 12, i * 15 + 14])
					edges.push([i * 15 + 13, i * 15 + 14])
					edges.push([i * 15 + 14, i * 15 + 15])
					edges.push([i * 15 + 15, ((i + 1) % 3) * 15 + 13])
				}
				return new Graph(46, edges)
			}
			case 'tutte coxeter': {
				const edges = []
				for (let i = 0; i < 30; i++) {
					edges.push([i, (i + 1) % 30])
				}
				for (let i = 0; i < 5; i++) {
					edges.push([i * 6, ((i + 1) % 5) * 6 + 3])
					edges.push([i * 6 + 1, ((i + 2) % 5) * 6 + 2])
					edges.push([i * 6 + 4, ((i + 1) % 5) * 6 + 5])
				}
				return new Graph(30, edges)
			}
			case 'wagner': {
				const edges = []
				for (let i = 0; i < 4; i++) {
					edges.push([i, i + 1])
					edges.push([i, i + 4])
					edges.push([i + 4, (i + 5) % 8])
				}
				return new Graph(8, edges)
			}
			case 'wells': {
				const edges = []
				for (let i = 0; i < 8; i++) {
					edges.push([i * 4, ((i + 1) % 8) * 4])
					edges.push([i * 4, ((i + 2) % 8) * 4 + 3])
					edges.push([i * 4 + 1, ((i + 1) % 8) * 4 + 3])
					edges.push([i * 4 + 1, ((i + 2) % 8) * 4])
					edges.push([i * 4 + 1, ((i + 2) % 8) * 4 + 3])
					edges.push([i * 4 + 1, ((i + 3) % 8) * 4 + 2])
					edges.push([i * 4 + 2, ((i + 1) % 8) * 4])
					edges.push([i * 4 + 2, ((i + 3) % 8) * 4 + 2])
					edges.push([i * 4 + 3, ((i + 1) % 8) * 4 + 1])
					edges.push([i * 4 + 3, ((i + 3) % 8) * 4 + 2])
				}
				return new Graph(32, edges)
			}
			case 'wiener araya': {
				const edges = []
				for (let i = 0; i < 4; i++) {
					edges.push([i * 10, i * 10 + 1])
					edges.push([i * 10, i * 10 + 2])
					edges.push([i * 10, ((i + 1) % 4) * 10])
					edges.push([i * 10 + 1, i * 10 + 3])
					edges.push([i * 10 + 1, i * 10 + 5])
					edges.push([i * 10 + 2, i * 10 + 4])
					edges.push([i * 10 + 2, ((i + 1) % 4) * 10 + 5])
					edges.push([i * 10 + 3, i * 10 + 4])
					edges.push([i * 10 + 3, i * 10 + 7])
					edges.push([i * 10 + 4, i * 10 + 9])
					edges.push([i * 10 + 5, i * 10 + 6])
					edges.push([i * 10 + 6, i * 10 + 7])
					edges.push([i * 10 + 6, ((i + 3) % 4) * 10 + 9])
					edges.push([i * 10 + 7, i * 10 + 8])
					edges.push([i * 10 + 8, i * 10 + 9])
					if (i % 2 === 1) {
						edges.push([i * 10 + 8, ((i + 1) % 4) * 10 + 8])
						edges.push([i * 10 + 8, i === 1 ? 40 : 41])
					} else {
						edges.push([i * 10 + 9, i === 0 ? 40 : 41])
					}
				}
				edges.push([40, 41])
				return new Graph(42, edges)
			}
		}
	}

	/**
	 * Number of nodes
	 * @type {number}
	 */
	get order() {
		return this._nodes.length
	}

	/**
	 * Number of edges
	 * @type {number}
	 */
	get size() {
		return this._edges.length
	}

	/**
	 * Nodes
	 * @type {unknown[]}
	 */
	get nodes() {
		return this._nodes
	}

	/**
	 * Edges
	 * @type {Edge[]}
	 */
	get edges() {
		return this._edges
	}

	/**
	 * Returns a string of DOT format.
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
		return `${s}}`
	}

	/**
	 * Returns a string represented this graph.
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
	 * @returns {Graph} Copied grpah
	 */
	copy() {
		const edges = this._edges.map(e => new Edge(e[0], e[1], e.value0, e.direct))
		const nodes = this._nodes.concat()
		return new Graph(nodes, edges)
	}

	/**
	 * Return degree of the node.
	 * @overload
	 * @param {number} k Index of target node
	 * @param {boolean} [undirect] Count undirected edges
	 * @param {boolean | 'in' | 'out'} [direct] Count directed edges
	 * @returns {number} Degree of the node
	 */
	/**
	 * Return degree of the node.
	 * @overload
	 * @param {number} k Index of target node
	 * @param {'in' | 'out'} direct Count only directed edges.
	 * @returns {number} Degree of the node
	 */
	/**
	 * @param {number} k Index of target node
	 * @param {boolean | 'in' | 'out'} [undirect] Count undirected edges. If `in` or `out` is specified, only direct edges are counted and `direct` parameter is ignored.
	 * @param {boolean | 'in' | 'out'} [direct] Count directed edges
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
	 * @overload
	 * @param {number} k Index of target node
	 * @param {boolean} [undirect] Check undirected edges
	 * @param {boolean | 'in' | 'out'} [direct] Check directed edges
	 * @returns {number[]} Indexes of adjacency nodes
	 */
	/**
	 * Return indexes of adjacency nodes.
	 * @overload
	 * @param {number} k Index of target node
	 * @param {'in' | 'out'} direct Check only directed edges
	 * @returns {number[]} Indexes of adjacency nodes
	 */
	/**
	 * @param {number} k Index of target node
	 * @param {boolean | 'in' | 'out'} [undirect] Check undirected edges. If `in` or `out` is specified, only direct edges are checked and `direct` parameter is ignored.
	 * @param {boolean | 'in' | 'out'} [direct] Check directed edges
	 * @returns {number[]} Indexes of adjacency nodes
	 */
	adjacencies(k, undirect = true, direct = true) {
		if (undirect === 'in' || undirect === 'out') {
			direct = undirect
			undirect = false
		}
		const nodesSet = new Set()
		for (const e of this._edges) {
			if (undirect && !e.direct && (e[0] === k || e[1] === k)) {
				nodesSet.add(e[0] === k ? e[1] : e[0])
			} else if (direct === true && e.direct && (e[0] === k || e[1] === k)) {
				nodesSet.add(e[0] === k ? e[1] : e[0])
			} else if (direct === 'in' && e.direct && e[1] === k) {
				nodesSet.add(e[0])
			} else if (direct === 'out' && e.direct && e[0] === k) {
				nodesSet.add(e[1])
			}
		}
		const nodes = [...nodesSet]
		nodes.sort((a, b) => a - b)
		return nodes
	}

	/**
	 * Returns indexes of each components.
	 * @returns {number[][]} Indexes of each components
	 */
	components() {
		const checked = Array(this._nodes.length).fill(false)
		const stack = [0]
		const comps = []
		let curcomp = []
		while (stack.length > 0 || checked.some(v => !v)) {
			if (stack.length === 0) {
				curcomp.sort((a, b) => a - b)
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
			curcomp.sort((a, b) => a - b)
			comps.push(curcomp)
		}
		return comps
	}

	/**
	 * Returns indexes of each biconnected components.
	 * @returns {number[][]} Indexes of each biconnected components
	 */
	biconnectedComponents() {
		const structure = this.toSimple().toUndirected()
		const notcheckedComponents = structure.components()
		const components = []
		while (notcheckedComponents.length > 0) {
			const component = notcheckedComponents.pop()
			const subg = structure.inducedSub(component)
			const a = subg.articulations()
			if (a.length === 0) {
				components.push(component)
				continue
			}
			const sep = a[0]
			subg.removeNode(sep)
			const subcomp = subg.components()
			for (let i = 0; i < subcomp.length; i++) {
				const c = []
				for (let j = 0; j < subcomp[i].length; j++) {
					if (subcomp[i][j] >= sep) {
						c.push(component[subcomp[i][j] + 1])
					} else {
						c.push(component[subcomp[i][j]])
					}
				}
				c.push(component[sep])
				c.sort((a, b) => a - b)
				notcheckedComponents.push(c)
			}
		}
		return components
	}

	/**
	 * Returns diameter of this graph.
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
	 * @returns {number} Girth
	 */
	girth() {
		let min_loop = Infinity
		for (let s = 0; s < this._nodes.length; s++) {
			const stack = [[[s], Array(this._edges.length).fill(false)]]
			while (stack.length > 0) {
				const [path, used] = stack.shift()
				const i = path[path.length - 1]
				for (let k = 0; k < this._edges.length; k++) {
					if (used[k]) {
						continue
					}
					const e = this._edges[k]
					if (e[0] === i) {
						if (e[1] === s) {
							if (path.length < min_loop) {
								min_loop = path.length
							}
							stack.length = 0
							break
						} else if (path.includes(e[1])) {
							continue
						}
						const u = used.concat()
						u[k] = true
						stack.push([path.concat(e[1]), u])
					}
					if (!e.direct && e[1] === i) {
						if (e[0] === s) {
							if (path.length < min_loop) {
								min_loop = path.length
							}
							stack.length = 0
							break
						} else if (path.includes(e[0])) {
							continue
						}
						const u = used.concat()
						u[k] = true
						stack.push([path.concat(e[0]), u])
					}
				}
			}
		}
		return min_loop
	}

	/**
	 * Returns index of all cliques.
	 * @overload
	 * @returns {number[][][]} Index of cliques
	 */
	/**
	 * Returns index of cliques.
	 * @overload
	 * @param {number} k Size of clique
	 * @returns {number[][]} Index of cliques
	 */
	/**
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
	 * @returns {number} Chromatic number
	 */
	chromaticNumber() {
		const n = this._nodes.length
		if (n <= 1) {
			return n
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

		return this.chromaticNumberWelchPowell()
	}

	/**
	 * Returns chromatic number of this graph with Welch-Powell algorithm.
	 * @returns {number} Chromatic number
	 */
	chromaticNumberWelchPowell() {
		const n = this._nodes.length
		const alist = this.adjacencyList()
		const degrees = []
		for (let i = 0; i < n; i++) {
			degrees[i] = [i, this.degree(i)]
		}
		degrees.sort((a, b) => b[1] - a[1])
		let c = 0
		const colors = Array(n).fill(-1)
		while (true) {
			const i = colors.indexOf(-1)
			if (i < 0) {
				break
			}
			colors[i] = c
			for (let k = 0; k < n; k++) {
				if (colors[k] >= 0) {
					continue
				}
				if (alist[k].every(v => colors[v] !== c)) {
					colors[k] = c
				}
			}
			c++
		}
		return c
	}

	/**
	 * Returns chromatic index of this graph.
	 * @returns {number} Chromatic index
	 */
	chromaticIndex() {
		const components = this.components()
		let maxci = 0
		for (let k = 0; k < components.length; k++) {
			const g = this.inducedSub(components[k])
			let ci = -1
			if (g._edges.length <= 1) {
				ci = g._edges.length
			} else if (g.isBipartite()) {
				ci = 0
				for (let i = 0; i < g._nodes.length; i++) {
					ci = Math.max(ci, g.degree(i))
				}
			} else if (g.isComplete()) {
				ci = g._nodes.length % 2 === 0 ? g._nodes.length - 1 : g._nodes.length
			} else {
				throw new GraphException('Not implemented')
			}
			maxci = Math.max(maxci, ci)
		}
		return maxci
	}

	/**
	 * Returns indexes of articulation (cut) nodes.
	 * @returns {number[]} Indexes of articulation nodes
	 */
	articulations() {
		return this.articulationsLowLink()
	}

	/**
	 * Returns indexes of articulation (cut) nodes with checking each node.
	 * @returns {number[]} Indexes of articulation nodes
	 */
	articulationsEachNodes() {
		const n = this._nodes.length
		const a = []
		for (let i = 0; i < n; i++) {
			const adj = this.adjacencies(i).filter(v => v !== i)
			if (adj.length <= 1) {
				continue
			}
			const checked = Array(n).fill(false)
			checked[i] = true
			const stack = [adj[0]]
			while (stack.length > 0) {
				const k = stack.pop()
				if (checked[k]) {
					continue
				}
				checked[k] = true
				for (const e of this._edges) {
					if (e[0] === k) {
						stack.push(e[1])
					}
					if (e[1] === k) {
						stack.push(e[0])
					}
				}
			}
			if (adj.some(k => !checked[k])) {
				a.push(i)
			}
		}
		return a
	}

	/**
	 * Returns indexes of articulation (cut) nodes with checking lowlinks.
	 * @returns {number[]} Indexes of articulation nodes
	 */
	articulationsLowLink() {
		const n = this._nodes.length
		if (n === 0) {
			return []
		}
		const ord = Array(n).fill(-1)
		const low = []
		const parent = Array(n).fill(-1)
		const alist = this.adjacencyList()

		let d = 0
		const a = []
		const search = u => {
			ord[u] = low[u] = d++
			let cc = 0
			let isArt = false
			for (const v of alist[u]) {
				if (ord[v] < 0) {
					parent[v] = u
					search(v)
					cc++
					if (low[v] >= ord[u]) {
						isArt = true
					}
					low[u] = Math.min(low[u], low[v])
				} else if (v !== parent[u]) {
					low[u] = Math.min(low[u], ord[v])
				}
			}
			if ((parent[u] >= 0 && isArt) || (parent[u] < 0 && cc > 1)) {
				a.push(u)
			}
		}
		search(0)
		a.sort((a, b) => a - b)
		return a
	}

	/**
	 * Returns edges of bridge.
	 * @returns {Edge[]} Bridge edges
	 */
	bridges() {
		return this.bridgesLowLink()
	}

	/**
	 * Returns edges of bridge with checking lowlinks.
	 * @returns {Edge[]} Bridge edges
	 */
	bridgesLowLink() {
		const n = this._nodes.length
		if (n === 0 || this._edges.length === 0) {
			return []
		}
		const ord = Array(n).fill(-1)
		const low = []
		const parent = Array(n).fill(-1)
		const alist = this.adjacencyList()

		let d = 0
		const search = u => {
			ord[u] = low[u] = d++
			for (const v of alist[u]) {
				if (ord[v] < 0) {
					parent[v] = u
					search(v)
					low[u] = Math.min(low[u], low[v])
				} else if (v !== parent[u]) {
					low[u] = Math.min(low[u], ord[v])
				}
			}
		}
		search(0)
		const cons = Array.from({ length: n }, () => Array(n).fill(0))
		for (const e of this._edges) {
			cons[e[0]][e[1]]++
			cons[e[1]][e[0]]++
		}
		const b = []
		for (const e of this._edges) {
			if (cons[e[0]][e[1]] === 1 && (ord[e[0]] < low[e[1]] || ord[e[1]] < low[e[0]])) {
				b.push(e)
			}
		}
		return b
	}

	/**
	 * Add the node.
	 * @param {unknown} [value] Value of the node
	 */
	addNode(value) {
		this._nodes[this._nodes.length] = value
	}

	/**
	 * Returns the node value.
	 * @overload
	 * @param {number} k Index of the node
	 * @returns {unknown} Node value
	 */
	/**
	 * Returns the node value.
	 * @overload
	 * @param {number[]} [k] Index of the node
	 * @returns {unknown[]} Node value
	 */
	/**
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
	 * Remove all nodes.
	 */
	clearNodes() {
		this._nodes = []
		this._edges = []
	}

	/**
	 * Add the edge.
	 * @param {number} from Index of the starting node of the edge
	 * @param {number} to Index of the end node of the edge
	 * @param {unknown} [value] Value of the edge
	 * @param {boolean} [direct] `true` if the edge is direct
	 */
	addEdge(from, to, value = null, direct = false) {
		if (from < 0 || this._nodes.length <= from || to < 0 || this._nodes.length <= to) {
			throw new GraphException('Index out of bounds.')
		}
		this._edges.push(new Edge(from, to, value, direct))
	}

	/**
	 * Returns the edges.
	 * @overload
	 * @param {number} from Index of the starting node of the edge
	 * @param {number} to Index of the end node of the edge
	 * @param {boolean} [undirect] Get undirected edges or not
	 * @param {boolean | 'forward' | 'backward'} [direct] Get directed edges or not
	 * @returns {Edge[]} Edges between `from` and `to`
	 */
	/**
	 * Returns the edges.
	 * @overload
	 * @param {number} from Index of the starting node of the edge
	 * @param {number} to Index of the end node of the edge
	 * @param {'forward' | 'backward'} direct Get only directed edges
	 * @returns {Edge[]} Edges between `from` and `to`
	 */
	/**
	 * @param {number} from Index of the starting node of the edge
	 * @param {number} to Index of the end node of the edge
	 * @param {boolean | 'forward' | 'backward'} [undirect] Get undirected edges or not. If `forward` or `backward` is specified, only direct edges are get and `direct` parameter is ignored.
	 * @param {boolean | 'forward' | 'backward'} [direct] Get directed edges or not
	 * @returns {Edge[]} Edges between `from` and `to`
	 */
	getEdges(from, to, undirect = true, direct = true) {
		if (from < 0 || this._nodes.length <= from || to < 0 || this._nodes.length <= to) {
			throw new GraphException('Index out of bounds.')
		}
		if (undirect === 'forward' || undirect === 'backward') {
			direct = undirect
			undirect = false
		}
		const edges = []
		for (const e of this._edges) {
			if (
				((undirect && !e.direct) || (direct === true && e.direct)) &&
				((e[0] === from && e[1] === to) || (e[0] === to && e[1] === from))
			) {
				edges.push(e)
			} else if (direct === 'forward' && e.direct && e[0] === from && e[1] === to) {
				edges.push(e)
			} else if (direct === 'backward' && e.direct && e[0] === to && e[1] === from) {
				edges.push(e)
			}
		}
		return edges
	}

	/**
	 * Remove the edges.
	 * @param {number} from Index of the starting node of the edge
	 * @param {number} to Index of the end node of the edge
	 * @param {boolean | null} [direct] `null` to remove direct and undirect edges, `true` to remove only direct edges, `false` to remove only undirect edges.
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
	 * Remove all edges.
	 */
	clearEdges() {
		this._edges = []
	}

	/**
	 * Returns adjacency matrix
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
	 * @param {'both' | 'in' | 'out'} [direct] Indegree or outdegree
	 * @returns {number[][]} Adjacency list
	 */
	adjacencyList(direct = 'both') {
		const n = this._nodes.length
		const a = Array.from({ length: n }, () => new Set())
		for (const e of this._edges) {
			if (e[0] === e[1]) {
				a[e[0]].add(e[1])
			} else if (e.direct && direct !== 'both') {
				if (direct === 'in') {
					a[e[1]].add(e[0])
				} else {
					a[e[0]].add(e[1])
				}
			} else {
				a[e[0]].add(e[1])
				a[e[1]].add(e[0])
			}
		}
		for (let i = 0; i < n; i++) {
			a[i] = [...a[i]]
			a[i].sort((a, b) => a - b)
		}
		return a
	}

	/**
	 * Returns degree matrix.
	 * @param {'both' | 'in' | 'out'} [direct] Indegree or outdegree
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
	 * @returns {boolean} `true` if this is null graph
	 */
	isNull() {
		return this._nodes.length === 0
	}

	/**
	 * Returns if this is edgeless graph or not.
	 * @returns {boolean} `true` if this is edgeless graph
	 */
	isEdgeless() {
		return this._edges.length === 0
	}

	/**
	 * Returns if this is undirected graph or not.
	 * @returns {boolean} `true` if this is undirected graph
	 */
	isUndirected() {
		return this._edges.every(e => !e.direct)
	}

	/**
	 * Returns if this is directed graph or not.
	 * @returns {boolean} `true` if this is directed graph
	 */
	isDirected() {
		return this._edges.every(e => e.direct)
	}

	/**
	 * Returns if this is mixed graph or not.
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
	 * Returns if this is oriented graph or not.
	 * @returns {boolean} `true` if this is oriented graph
	 */
	isOriented() {
		const n = this._nodes.length
		const amat = Array.from({ length: n }, () => Array(n).fill(false))
		for (const e of this._edges) {
			if (!e.direct) {
				return false
			}
			if (amat[e[0]][e[1]]) {
				return false
			}
			amat[e[0]][e[1]] = amat[e[1]][e[0]] = true
		}
		return true
	}

	/**
	 * Returns if this is weighted graph or not.
	 * @returns {boolean} `true` if this is weighted graph
	 */
	isWeighted() {
		return this._edges.some(e => e.weighted)
	}

	/**
	 * Returns if this is simple graph or not.
	 * @returns {boolean} `true` if this is simple graph
	 */
	isSimple() {
		const alist = Array.from({ length: this._nodes.length }, () => [])
		for (const e of this._edges) {
			if (e[0] === e[1]) {
				return false
			}
			if (alist[e[0]].includes(e[1]) || alist[e[1]].includes(e[0])) {
				return false
			}
			alist[e[0]].push(e[1])
		}
		return true
	}

	/**
	 * Returns if this is connected graph or not.
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
	 * @returns {boolean} `true` if this is biconnected graph
	 */
	isBiconnected() {
		return this.articulations().length === 0
	}

	/**
	 * Returns if this is tree or not.
	 * @returns {boolean} `true` if this is tree
	 */
	isTree() {
		return this.isConnected() && !this.hasCycle()
	}

	/**
	 * Returns if this is forest or not.
	 * @returns {boolean} `true` if this is forest
	 */
	isForest() {
		return !this.hasCycle()
	}

	/**
	 * Returns if this is bipartite graph or not.
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
	 * @param {number} [n] Degree of vertices
	 * @returns {boolean} `true` if this is regular graph
	 */
	isRegular(n = null) {
		if (this._nodes.length <= 1) {
			return true
		}
		const d0 = this.degree(0)
		for (let i = 1; i < this._nodes.length; i++) {
			const di = this.degree(i)
			if (d0 !== di || (n !== null && di !== n)) {
				return false
			}
		}
		return true
	}

	/**
	 * Returns if this is plainer graph or not.
	 * @returns {boolean} `true` if this is plainer graph
	 */
	isPlainer() {
		const structure = this.toSimple().toUndirected()
		const components = structure.components()
		return components.every(comp => {
			const g = structure.inducedSub(comp)
			const n = g._nodes.length
			const edgeCount = g._edges.length
			if (n <= 4 || edgeCount <= 8) {
				return true
			}
			if (edgeCount > 3 * n - 6) {
				return false
			}
			if (g.clique(5).length > 0) {
				return false
			}
			if (n <= 5) {
				return true
			}
			const girth = g.girth()
			if (edgeCount > (girth * (n - 2)) / (girth - 2)) {
				return false
			}

			const degreelt5 = []
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
	 * @returns {boolean} `true` if this is plainer graph
	 */
	isPlainerAddVertex() {
		const bubble = (tree, set) => {
			let blockCount = 0
			let offTheTop = 0
			const queue = []
			const nodes = [tree]
			while (nodes.length > 0) {
				const node = nodes.pop()
				if (node.children && node.children.length > 0) {
					nodes.push(...node.children)
				} else if (set.includes(node.value)) {
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
			while (true) {
				const newQueue = []
				let changed = false
				for (let i = 0; i < queue.length; i++) {
					queue[i].label = null
					queue[i].pertinentLeafCount = 0
					if (queue[i].children && queue[i].children.length > 0) {
						newQueue.push(...queue[i].children)
						changed = true
					} else if (set.includes(queue[i].value)) {
						queue[i].pertinentLeafCount = 1
						newQueue.push(queue[i])
					} else {
						newQueue.push(queue[i])
					}
				}
				queue.splice(0, queue.length, ...newQueue)
				if (!changed) break
			}
			const needCount = queue.reduce((s, v) => s + (set.includes(v.value) ? 1 : 0), 0)
			while (queue.length > 0) {
				const x = queue.shift()
				if (x.parent) {
					x.parent.pertinentLeafCount += x.pertinentLeafCount
				}
				if (!x.children || x.children.length === 0) {
					x.label = set.includes(x.value) ? 'full' : 'empty'
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
										const c = { type: 'p', children: cfull, label: 'full', parent: cpartial[0] }
										c.children.forEach(n => (n.parent = c))
										cpartial[0].children.push(c)
									}
								} else if (cpartial.length === 2) {
									const c = { type: 'q', children: [], label: 'partial' }
									c.children.push(...cpartial[0].children)
									c.children.push(...cfull)
									c.children.push(...cpartial[1].children.reverse())
									c.children.forEach(n => (n.parent = c))
									x.children.push(c)
									x.children.forEach(n => (n.parent = x))
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
								x.children.forEach(n => (n.parent = x))
							} else {
								return false
							}
						}
					} else if (x.type === 'q') {
						if (x.children.at(-1).label === 'empty') {
							x.children.reverse()
						}
						if (x.pertinentLeafCount === needCount) {
							if (cpartial.length === 0) {
								let reqState = 'empty'
								let flipCount = 0
								for (let i = 0; i < x.children.length; i++) {
									if (x.children[i].label !== reqState && flipCount < 2) {
										reqState = reqState === 'empty' ? 'full' : 'empty'
										flipCount++
									} else if (x.children[i].label !== reqState) {
										return false
									}
								}
							} else if (cpartial.length === 1) {
								let reqState = 'empty'
								let flipCount = 0
								const cn = []
								for (let i = 0; i < x.children.length; i++) {
									if (x.children[i].label === 'partial') {
										if (reqState === 'empty') {
											cn.push(...x.children[i].children)
											reqState = 'full'
										} else {
											cn.push(...x.children[i].children.reverse())
											reqState = 'empty'
										}
									} else if (x.children[i].label !== reqState && flipCount < 1) {
										reqState = reqState === 'empty' ? 'full' : 'empty'
										flipCount++
										cn.push(x.children[i])
									} else if (x.children[i].label === reqState) {
										cn.push(x.children[i])
									} else {
										return false
									}
								}
								x.children = cn
								x.children.forEach(n => (n.parent = x))
							} else if (cpartial.length === 2) {
								let reqState = 'empty'
								const cn = []
								for (let i = 0; i < x.children.length; i++) {
									if (x.children[i].label === 'partial') {
										if (reqState === 'empty') {
											cn.push(...x.children[i].children)
											reqState = 'full'
										} else {
											cn.push(...x.children[i].children.reverse())
											reqState = 'empty'
										}
									} else if (x.children[i].label === reqState) {
										cn.push(x.children[i])
									} else {
										return false
									}
								}
								x.children = cn
								x.children.forEach(n => (n.parent = x))
							} else {
								return false
							}
						} else {
							if (cpartial.length === 0) {
								let reqState = 'empty'
								for (let i = 0; i < x.children.length; i++) {
									if (x.children[i].label === 'full') {
										reqState = 'full'
									} else if (x.children[i].label !== reqState) {
										return false
									}
								}
							} else if (cpartial.length === 1) {
								let reqState = 'empty'
								const cn = []
								for (let i = 0; i < x.children.length; i++) {
									if (x.children[i].label === 'partial') {
										cn.push(...x.children[i].children)
										reqState = 'full'
									} else if (x.children[i].label === reqState) {
										cn.push(x.children[i])
									} else {
										return false
									}
								}
								x.children = cn
								x.children.forEach(n => (n.parent = x))
							} else {
								return false
							}
						}
						x.label = 'partial'
					}
				}
				if (x.pertinentLeafCount === needCount) {
					break
				} else if (x.parent) {
					if (x.parent.children.every(y => y.label)) {
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
				} else if (set.includes(node.value)) {
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

		const components = this.biconnectedComponents()
		return components.every(comp => {
			const sg = this.inducedSub(comp)
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
			for (let k = 1; k < n; k++) {
				const f1 = bubble(root, [order[k]])
				const f2 = reduce(root, [order[k]])
				if (!f1 || !f2) {
					return false
				}
				const newc = alist[order[k]].filter(j => order.indexOf(j) > k).map(j => ({ value: j }))
				const rt = getRoot(root, [order[k]])
				if (rt.type === 'q') {
					const node = { type: 'p', children: newc, parent: rt }
					node.children.forEach(n => (n.parent = node))
					const newChildren = []
					let added = false
					for (let i = 0; i < rt.children.length; i++) {
						if (rt.children[i].label === 'full') {
							if (!added) {
								newChildren.push(node)
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
					rt.children.forEach(n => (n.parent = rt))
				}
			}

			return true
		})
	}

	_stNumbering(s = 0, t = null) {
		const n = this._nodes.length
		if (n === 0) {
			return []
		} else if (n === 1) {
			return [1]
		}
		if (this.articulations().length > 0) {
			throw new Error('Only biconnected graph can calculate st-numbering')
		}
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
					edgeState[j] = nodeState[w] = nodeState[v] = 'old'
					while (w >= 0) {
						const loww = low[w]
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
	 * @returns {boolean} `true` if this is symmetric graph
	 */
	isSymmetric() {
		if (this._nodes.length <= 1) {
			return true
		}
		if (this._edges.length <= 1) {
			return true
		}
		throw new GraphException('Not implemented')
	}

	/**
	 * Returns if this is directed acyclic graph or not.
	 * @returns {boolean} `true` if this is directed acyclic graph
	 */
	isDAG() {
		return this.isDirected() && !this.hasCycle()
	}

	/**
	 * Returns if this is separable graph or not.
	 * @returns {boolean} `true` if this is separable graph
	 */
	isSeparable() {
		return !this.isBiconnected()
	}

	/**
	 * Returns if this is Eulerian graph or not.
	 * @returns {boolean} `true` if this is Eulerian graph
	 */
	isEulerian() {
		if (!this.isConnected()) {
			return false
		}
		const deg = Array.from(this._nodes, () => ({ und: 0, dir: 0 }))
		for (const edge of this._edges) {
			if (!edge.direct) {
				deg[edge[0]].und++
				deg[edge[1]].und++
			} else {
				deg[edge[0]].dir--
				deg[edge[1]].dir++
			}
		}
		for (let i = 0; i < deg.length; i++) {
			if (Math.abs(deg[i].dir) > deg[i].und) {
				return false
			} else if ((deg[i].und - Math.abs(deg[i].dir)) % 2 === 1) {
				return false
			}
		}
		return true
	}

	/**
	 * Returns if this is semi-Eulerian graph or not.
	 * @returns {boolean} `true` if this is semi-Eulerian graph
	 */
	isSemiEulerian() {
		if (!this.isConnected()) {
			return false
		}
		const deg = Array.from(this._nodes, () => ({ und: 0, dir: 0 }))
		for (const edge of this._edges) {
			if (!edge.direct) {
				deg[edge[0]].und++
				deg[edge[1]].und++
			} else {
				deg[edge[0]].dir--
				deg[edge[1]].dir++
			}
		}
		let undOdd = 0
		let dirIn = 0
		let dirOut = 0
		for (let i = 0; i < deg.length; i++) {
			if (Math.abs(deg[i].dir) <= deg[i].und) {
				if ((deg[i].und - Math.abs(deg[i].dir)) % 2 === 1) {
					undOdd++
				}
			} else if (Math.abs(deg[i].dir) >= 2) {
				return false
			} else if (deg[i].dir > 0) {
				dirIn++
			} else {
				dirOut++
			}
			if (undOdd + dirIn + dirOut > 2 || dirIn >= 2 || dirOut >= 2) {
				return false
			}
		}
		if (undOdd === 0 && dirIn === 0 && dirOut === 0) {
			return false
		}
		return true
	}

	/**
	 * Returns if this is Hamiltonian graph or not.
	 * @returns {boolean} `true` if this is Hamiltonian graph
	 */
	isHamiltonian() {
		if (this._nodes.length >= 3 && this.isSimple()) {
			let mindeg = Infinity
			for (let i = 0; i < this._nodes.length; i++) {
				mindeg = Math.min(mindeg, this.degree(i))
			}
			if (mindeg >= this._nodes.length / 2) {
				return true
			}
		}
		if (!this.isConnected()) {
			return false
		}
		const hamiltonian = this.hamiltonianCycle()
		return hamiltonian.length > 0
	}

	/**
	 * Returns if this is semi-Hamiltonian graph or not.
	 * @returns {boolean} `true` if this is semi-Hamiltonian graph
	 */
	isSemiHamiltonian() {
		if (this._nodes.length >= 3 && this.isSimple()) {
			let mindeg = Infinity
			for (let i = 0; i < this._nodes.length; i++) {
				mindeg = Math.min(mindeg, this.degree(i))
			}
			if (mindeg >= this._nodes.length / 2) {
				return false
			}
		}
		if (!this.isConnected()) {
			return false
		}
		const hamiltonianPath = this.hamiltonianPath()
		if (hamiltonianPath.length === 0) {
			return false
		}
		if (this._nodes.length <= 2) {
			return this.hamiltonianCycle().length === 0
		}
		return hamiltonianPath.every(p => this.getEdges(p.at(-1), p[0], true, 'forward').length === 0)
	}

	/**
	 * Returns if this has cycle or not.
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
						} else if (path.includes(e[1])) {
							continue
						}
						const u = used.concat()
						u[k] = true
						stack.push([path.concat(e[1]), u])
					}
					if (!e.direct && e[1] === i) {
						if (e[0] === s) {
							return true
						} else if (path.includes(e[0])) {
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
	 * Returns graph of directed edges converted to undirected.
	 * @returns {Graph} Undirected graph
	 */
	toUndirected() {
		const graph = this.copy()
		for (const edge of graph._edges) {
			edge.direct = false
		}
		return graph
	}

	/**
	 * Returns a graph with multiple edges and loops removed.
	 * @returns {Graph} Simple graph
	 */
	toSimple() {
		const n = this._nodes.length
		const graph = new Graph(this._nodes.concat())
		const conChecks = Array.from({ length: n }, () => Array(n).fill(false))
		for (const e of this._edges) {
			if (e[0] !== e[1] && !conChecks[e[0]][e[1]]) {
				graph.addEdge(e[0], e[1], e.value0, e.direct)
				conChecks[e[0]][e[1]] = conChecks[e[1]][e[0]] = true
			}
		}
		return graph
	}

	/**
	 * Returns (sub) graph isomorphism maps from 'g' to this (sub) graph.
	 * @param {Graph} g Other graph
	 * @returns {number[][]} Isomorphism maps from 'g' to this (sub) graph
	 */
	isomorphism(g) {
		return this.isomorphismUllmann(g)
	}

	/**
	 * Returns (sub) graph isomorphism maps from 'g' to this (sub) graph with Ullmann algorithm.
	 * @param {Graph} g Other graph
	 * @returns {number[][]} Isomorphism maps from 'g' to this (sub) graph
	 */
	isomorphismUllmann(g) {
		if (!this.isUndirected()) {
			throw new GraphException('Currentry, isomorphismUllmann is only implemented for undirected graph.')
		}
		const nbeta = this._nodes.length
		const B = Matrix.zeros(nbeta, nbeta)
		for (const edge of this._edges) {
			B.set(edge[0], edge[1], 1)
			B.set(edge[1], edge[0], 1)
		}
		const betaalist = this.adjacencyList()
		const nalpha = g._nodes.length
		const A = Array.from(g._nodes, () => Array(nalpha).fill(0))
		for (const edge of g._edges) {
			A[edge[0]][edge[1]] = A[edge[1]][edge[0]] = 1
		}
		const alphaalist = g.adjacencyList()

		const patterns = []
		const check = (usedCols, row, m) => {
			if (row === nalpha) {
				const c = m.dot(m.dot(B).t)
				let f = true
				for (let i = 0; i < nalpha && f; i++) {
					for (let j = 0; j < nalpha && f; j++) {
						if (A[i][j] === 1 && c.at(i, j) === 0) {
							f = false
						}
					}
				}
				if (f) {
					const p = []
					for (let i = 0; i < nbeta; i++) {
						if (usedCols[i] >= 0) {
							p[usedCols[i]] = i
						}
					}
					patterns.push(p)
				}
				return
			}
			m = m.copy()
			for (let i = 0; i < nalpha; i++) {
				for (let j = 0; j < nbeta; j++) {
					if (m.at(i, j) !== 1) {
						continue
					}
					for (const s of alphaalist[i]) {
						if (betaalist[j].every(t => m.at(s, t) !== 1)) {
							m.set(i, j, 0)
							break
						}
					}
				}
			}
			if (m.sum(1).every(v => v === 0)) {
				return
			}

			for (let k = 0; k < nbeta; k++) {
				if (usedCols[k] >= 0 || m.at(row, k) === 0) {
					continue
				}
				const cp = []
				for (let i = 0; i < nbeta; i++) {
					cp.push(m.at(row, i))
					m.set(row, i, i === k ? 1 : 0)
				}
				usedCols[k] = row
				check(usedCols.concat(), row + 1, m)
				usedCols[k] = -1
				for (let i = 0; i < nbeta; i++) {
					m.set(row, i, cp[i])
				}
			}
		}
		const m = Matrix.zeros(nalpha, nbeta)
		for (let i = 0; i < nalpha; i++) {
			for (let j = 0; j < nbeta; j++) {
				if (alphaalist[i].length <= betaalist[j].length) {
					m.set(i, j, 1)
				}
			}
		}
		check(Array(nbeta).fill(-1), 0, m)
		return patterns
	}

	/**
	 * Returns (sub) graph isomorphism maps from 'g' to this (sub) graph with VF2 algorithm.
	 * @param {Graph} g Other graph
	 * @returns {number[][]} Isomorphism maps from 'g' to this (sub) graph
	 */
	isomorphismVF2(g) {
		throw new GraphException('Not implemented')
	}

	/**
	 * Returns induced sub graph.
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
	 * Returns line graph.
	 * @returns {Graph} Line graph
	 */
	line() {
		const g = new Graph(this._edges.concat())
		const n = g._nodes.length
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				if (g._nodes[i][0] === g._nodes[j][0] || g._nodes[i][0] === g._nodes[j][1]) {
					g.addEdge(i, j, this._nodes[g._nodes[i][0]])
				} else if (g._nodes[i][1] === g._nodes[j][0] || g._nodes[i][1] === g._nodes[j][1]) {
					g.addEdge(i, j, this._nodes[g._nodes[i][1]])
				}
			}
		}
		return g
	}

	/**
	 * Contract this graph.
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
				this._edges.push(new Edge(k, e[1], e.value0, e.direct))
			}
		}
	}

	/**
	 * Cleave the node.
	 * @param {number} a Index of node
	 */
	cleaving(a) {
		this._nodes.push(null)
		const k = this._nodes.length - 1
		for (let i = this._edges.length - 1; i >= 0; i--) {
			const e = this._edges[i]
			if (e[0] === a && e[1] === a) {
				this._edges.push(new Edge(k, k, e.value0, e.direct))
			} else if (e[0] === a) {
				this._edges.push(new Edge(k, e[1], e.value0, e.direct))
			} else if (e[1] === a) {
				this._edges.push(new Edge(e[0], k, e.value0, e.direct))
			}
		}
	}

	/**
	 * Take the disjoint union of this graph and other graph.
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
					nodes.push([this._nodes[i], g._nodes[j]])
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
					nodes.push([this._nodes[i], g._nodes[j]])
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
					nodes.push([this._nodes[i], g._nodes[j]])
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
					nodes.push([this._nodes[i], g._nodes[j]])
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
	 * @overload
	 * @param {null} [from] Index of start nodes
	 * @returns {{length: number, path: number[]}[][]} Shortest length and path for all nodes
	 */
	/**
	 * Returns shortest path.
	 * @overload
	 * @param {number} from Index of start nodes
	 * @returns {{length: number, prev: number, path: number[]}[]} Shortest length and path for all nodes
	 */
	/**
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
	 * @returns {Graph} Minimum spanning tree
	 */
	minimumSpanningTree() {
		return this.minimumSpanningTreePrim()
	}

	/**
	 * Returns minimum spanning tree with Prim's algorithm.
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
	 * Returns Hamiltonian path
	 * @param {number} [from] Index of start node
	 * @returns {number[][]} Hamiltonian path
	 */
	hamiltonianPath(from) {
		if (!this.isConnected()) {
			return []
		}
		return this.hamiltonianPathDynamicProgramming(from)
	}

	/**
	 * Returns Hamiltonian path with dynamic programming
	 * @param {number} [from] Index of start node
	 * @returns {number[][]} Hamiltonian path
	 */
	hamiltonianPathDynamicProgramming(from) {
		const n = this._nodes.length
		let lastPath = []
		if (typeof from === 'number') {
			lastPath.push({ s: new Set([from]), v: new Map([[from, [[from]]]]) })
		} else {
			for (let i = 0; i < n; i++) {
				lastPath.push({ s: new Set([i]), v: new Map([[i, [[i]]]]) })
			}
		}
		const adjList = this.adjacencyList('in')
		for (let k = 1; k < n; k++) {
			const nextPath = []
			for (let i = 0; i < n; i++) {
				for (let c = 0; c < lastPath.length; c++) {
					const p = lastPath[c]
					if (p.s.has(i)) continue
					const path = []
					for (const v of p.v.keys()) {
						if (adjList[i].indexOf(v) < 0) continue
						path.push(...p.v.get(v).map(c => [...c, i]))
					}
					if (path.length === 0) continue
					const ep = nextPath.find(np => [...p.s, i].every(j => np.s.has(j)))
					if (ep) {
						ep.v.set(i, path)
					} else {
						nextPath.push({ s: new Set([...p.s, i]), v: new Map([[i, path]]) })
					}
				}
			}
			lastPath = nextPath
		}
		return lastPath.flatMap(p => [...p.v.values()].flat())
	}

	/**
	 * Returns Hamiltonian cycle
	 * @returns {number[][]} Hamiltonian cycle
	 */
	hamiltonianCycle() {
		if (!this.isConnected()) {
			return []
		}
		const path = this.hamiltonianPath()
		if (this.order <= 1) {
			return path
		} else if (this.order === 2) {
			if (path.length <= 1 || this.getEdges(0, 1).length <= 1) {
				return []
			}
			return [
				[0, 1, 0],
				[1, 0, 1],
			]
		}
		return path.filter(p => this.getEdges(p.at(-1), p[0], true, 'forward').length > 0)
	}

	/**
	 * Returns cut size.
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
	 * @param {number} [minv] Minimum number for subset
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
	 * @param {number} [minv] Minimum number for subset
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
	 * @param {number} [minv] Minimum number for subset
	 * @param {number} [startnode] Start node index
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
			if (!mincutnodes.includes(i)) {
				mc.push(i)
			}
		}
		return [mincut, [mincutnodes, mc]]
	}

	/**
	 * Returns minimum cut.
	 * @param {number} [minv] Minimum number for subset
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
	 * @param {number} [minv] Minimum number for subset
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
