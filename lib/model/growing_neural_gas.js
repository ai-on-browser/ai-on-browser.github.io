/**
 * Growing neural gas
 */
export default class GrowingNeuralGas {
	// http://www.thothchildren.com/chapter/5c02328c41f88f267249e72b
	// https://en.wikipedia.org/wiki/Neural_gas
	/**
	 * @param {number} l
	 * @param {number} m
	 */
	constructor(l, m) {
		this._nodes = []
		this._edges = []
		this._err = []

		this._l = l
		this._m = m
		this._k = 0
		this._eps = 0.01
		this._err_fact = 0.99

		this._max_age = 5
		this._inserted_iteration = 20
	}

	/**
	 * Number of clusters
	 * @type {number}
	 */
	get size() {
		const c = []
		const s = new Set()
		for (let i = 0; i < this._nodes.length; i++) {
			if (s.has(i)) {
				continue
			}
			const n = this._topological_neighbor(i)
			c.push(i)
			for (let k = 0; k < n.length; k++) {
				s.add(n[k])
			}
		}
		return c.length
	}

	_init(x) {
		const n = x.length
		const n1 = Math.floor(Math.random() * n)
		const c1 = x[n1]
		const c2 = x[(n1 + Math.floor(n / 2)) % n]
		this._nodes = [c1, c2]
		this._edges = [[], []]
		this._err = [0, 0]
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
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
				if (Number.isFinite(this._edges[i][j])) {
					stack.push(j)
				}
			}
		}
		return tn
	}

	/**
	 * Update parameter.
	 * @param {number[]} x
	 */
	update(x) {
		const s = this._nodes.map((n, i) => [this._distance(x, n), i])
		s.sort((a, b) => a[0] - b[0])
		const s1 = s[0][1]
		const s2 = s[1][1]
		this._err[s1] += s[0][0]

		// const tn = this._topological_neighbor(s1)
		const tn = [s1]
		s.sort((a, b) => a[1] - b[1])
		for (let i = 0; i < tn.length; i++) {
			const c = this._nodes[tn[i]]
			for (let j = 0; j < c.length; j++) {
				c[j] += (x[j] - c[j]) * this._eps * Math.exp(-s[tn[i]][0] / this._l)
			}
		}

		for (let j = 0; j < this._edges[s1].length; j++) {
			if (Number.isFinite(this._edges[s1][j])) {
				this._edges[s1][j]++
				this._edges[j][s1]++

				if (this._edges[s1][j] >= this._max_age) {
					this._edges[s1][j] = null
					this._edges[j][s1] = null
				}
			}
		}
		this._edges[s1][s2] = 0
		this._edges[s2][s1] = 0

		for (let i = this._edges.length - 1; i >= 0; i--) {
			if (this._edges[i].some(Number.isFinite)) {
				continue
			}
			this._edges.splice(i, 1)
			for (let j = 0; j < this._edges.length; j++) {
				this._edges[j].splice(i, 1)
			}
			this._nodes.splice(i, 1)
			this._err.splice(i, 1)
		}

		this._k++
		this._l *= this._m
		if (this._k % this._inserted_iteration === 0) {
			const en = this._err.map((v, i) => [v, i])
			en.sort((a, b) => b[0] - a[0])
			const ei = en[0][1]

			let min_i = -1
			let min_d = Infinity
			for (let i = 0; i < this._nodes.length; i++) {
				if (i === ei) {
					continue
				}
				const d = this._distance(this._nodes[i], this._nodes[ei])
				if (d < min_d) {
					min_d = d
					min_i = i
				}
			}
			const n = this._nodes[min_i].map((v, i) => (v + this._nodes[ei][i]) / 2)
			this._nodes.push(n)
			this._edges.push([])
			this._err.push(0)
		}
		this._err = this._err.map(v => v * this._err_fact)
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x
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
	 * @param {Array<Array<number>>} datas
	 * @returns {number[]}
	 */
	predict(datas) {
		if (this._nodes.length === 0) {
			return
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
			const n = this._topological_neighbor(min_i)
			return Math.min(...n)
		})
	}
}
