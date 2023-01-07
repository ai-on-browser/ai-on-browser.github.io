/**
 * Growing cell structures
 */
export default class GrowingCellStructures {
	// https://www.demogng.de/JavaPaper/node23.html
	constructor() {
		this._nodes = []
		this._edges = []
		this._err = []

		this._k = 0
		this._eps_b = 0.06
		this._eps_n = 0.002
		this._alpha = 1
		this._beta = 0.0005

		this._inserted_iteration = 200
	}

	/**
	 * Number of clusters
	 *
	 * @type {number}
	 */
	get size() {
		return this._nodes.length
	}

	_init(x) {
		const n = x.length
		this._d = x[0].length

		const w = []
		for (let i = 0; i < Math.min(this._d + 1, n); i++) {
			const c = Math.floor(Math.random() * n)
			w.push(x[c].map(v => v * Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())))
		}
		this._nodes = w
		this._edges = w.map(() => Array(w.length).fill(1))
		this._err = Array(w.length).fill(0)
	}

	_distance(a, b) {
		return a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)
	}

	_topological_neighbor(n) {
		const tn = []
		const stack = [n]
		while (stack.length > 0) {
			const i = stack.pop()
			if (tn.indexOf(i) >= 0) {
				continue
			}
			tn.push(i)
			for (let j = 0; j < this._edges[i].length; j++) {
				if (this._connected(i, j)) {
					stack.push(j)
				}
			}
		}
		return tn
	}

	_connected(i, j) {
		return Number.isFinite(this._edges[i][j])
	}

	/**
	 * Update parameter.
	 *
	 * @param {number[]} x Training data
	 */
	update(x) {
		const ss = this._nodes.map((n, i) => [this._distance(x, n), i])
		ss.sort((a, b) => a[0] - b[0])
		const s = ss[0][1]
		this._err[s] += ss[0][0]

		const tn = this._topological_neighbor(s)
		ss.sort((a, b) => a[1] - b[1])
		for (let i = 0; i < tn.length; i++) {
			const c = this._nodes[tn[i]]
			for (let j = 0; j < c.length; j++) {
				const eps = tn[i] === s ? this._eps_b : this._eps_n
				c[j] += (x[j] - c[j]) * eps
			}
		}

		this._k++
		if (this._k % this._inserted_iteration === 0) {
			const en = this._err.map((v, i) => [v, i])
			en.sort((a, b) => b[0] - a[0])
			const q = en[0][1]

			let f = -1
			let min_d = Infinity
			for (let i = 0; i < this._nodes.length; i++) {
				if (i === q) {
					continue
				}
				const d = this._distance(this._nodes[i], this._nodes[q])
				if (d < min_d) {
					min_d = d
					f = i
				}
			}
			const wr = this._nodes[f].map((v, i) => (v + this._nodes[q][i]) / 2)
			this._nodes.push(wr)
			this._edges[q][f] = this._edges[f][q] = null
			const edge = []
			for (let i = 0; i < this._nodes.length; i++) {
				if (this._connected(q, i) && this._connected(f, i)) {
					edge[i] = 1
				}
			}
			edge[q] = edge[f] = 1
			this._edges.push(edge)

			const nr = edge.reduce((s, v) => (s + Number.isFinite(v) ? 1 : 0), 0)
			let err = 0
			for (let i = 0; i < edge.length; i++) {
				if (Number.isFinite(edge[i])) {
					this._err[i] -= (this._alpha / nr) * this._err[i]
					err += this._err[i]
				}
			}
			this._err.push(err / nr)
		}
		this._err = this._err.map(v => v - v * this._beta)
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 */
	fit(x) {
		if (this._nodes.length === 0) {
			this._init(x)
		}
		for (let i = 0; i < x.length; i++) {
			this.update(x[i])
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		if (this._nodes.length === 0) {
			throw new Error('Call fit before predict.')
		}
		return datas.map(value => {
			let min_d = Infinity
			let min_i = -1
			for (let i = 0; i < this._nodes.length; i++) {
				const d = this._distance(this._nodes[i], value)
				if (d < min_d) {
					min_d = d
					min_i = i
				}
			}
			return min_i
		})
	}
}
