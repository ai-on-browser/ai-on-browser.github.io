const logGamma = z => {
	// https://en.wikipedia.org/wiki/Lanczos_approximation
	// https://slpr.sakura.ne.jp/qp/gamma-function/
	let x = 0
	if (Number.isInteger(z)) {
		for (let i = 2; i < z; i++) {
			x += Math.log(i)
		}
	} else if (Number.isInteger(z - 0.5)) {
		const n = z - 0.5
		x = Math.log(Math.sqrt(Math.PI)) - Math.log(2) * n
		for (let i = 2 * n - 1; i > 0; i -= 2) {
			x += Math.log(i)
		}
	} else if (z < 0.5) {
		x = Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z)
	} else {
		const p = [
			676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,
			-0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
		]
		z -= 1
		x = 0.99999999999980993
		for (let i = 0; i < p.length; i++) {
			x += p[i] / (z + i + 1)
		}
		const t = z + p.length - 0.5
		x = Math.log(Math.sqrt(2 * Math.PI)) + Math.log(t) * (z + 0.5) - t + Math.log(x)
	}
	return x
}

class ArrayKeyMap {
	constructor() {
		this._map = new Map()
	}

	get size() {
		return this._map.size
	}

	_getKey(key) {
		if (this._map.has(key)) {
			return key
		}
		for (const k of this.keys()) {
			if (key.every((v, j) => v === k[j])) {
				return k
			}
		}
		return null
	}

	keys() {
		return this._map.keys()
	}

	has(key) {
		return this._getKey(key) !== null
	}

	get(key) {
		return this._map.get(this._getKey(key))
	}

	set(key, value) {
		const okey = this._getKey(key)
		if (okey !== null) {
			return this._map.set(okey, value)
		}
		return this._map.set(key, value)
	}
}

/**
 * Bayesian Network
 */
export default class BayesianNetwork {
	// http://www.ai.lab.uec.ac.jp/wp-content/uploads/2016/03/2c998b492dee21b62c17d77f786482f0.pdf
	// https://www.jstage.jst.go.jp/article/jjsai/25/6/25_803/_pdf
	// http://www.jfssa.jp/taikai/2009/program/docs/00034.pdf
	/**
	 * @param {number} alpha
	 */
	constructor(alpha) {
		this._th = null
		this._graph = null
		this._alpha = alpha
		this._ess = 1

		this._n = 0
		this._cand = null
		this._score_method = 'bdeu'
	}

	/**
	 * Fit model.
	 * @param {Array<Array<*>>} x
	 */
	fit(x) {
		if (!this._cand) {
			this._n = x[0].length
			this._cand = []
			for (let i = 0; i < this._n; i++) {
				this._cand[i] = [...new Set(x.map(v => v[i]))]
			}
		}
		this._fitStructure(x)
		this._fitParameter(x)
	}

	_fitStructure(x) {
		this._fitStructure_dp(x)
	}

	_fitStructure_dp(x) {
		const localScores = []
		const bpss = []
		for (let i = 0; i < this._n; i++) {
			localScores[i] = new ArrayKeyMap()
			bpss[i] = new ArrayKeyMap()
			for (let k = 0; k < 2 ** (this._n - 1); k++) {
				const p = k
					.toString(2)
					.padStart(this._n - 1, '0')
					.split('')
				p.splice(i, 0, '1')
				const key = p.map(v => +v)
				const c = p
					.map((v, j) => [v, j])
					.filter(v => v[0] === '1')
					.map(v => v[1])
				const xi = x.map(r => c.map(idx => r[idx]))
				const cand = c.map(idx => this._cand[idx])
				const g = []
				const gc = []
				for (let j = 0; j < c.length; j++) {
					if (c[j] === i) {
						g[j] = gc
					} else {
						g[j] = []
						gc.push(j)
					}
				}
				const score = this._score(xi, g, cand)
				localScores[i].set(key, score)

				let bps = [key, score]
				for (const bkey of bpss[i].keys()) {
					if (bkey.reduce((s, v) => s + v, 0) <= 1) {
						continue
					}
					let hm = 0
					for (let d = 0; d < key.length && hm < 2; d++) {
						if (key[d] === 1 && bkey[d] === 0) {
							hm++
						} else if (key[d] === 0 && bkey[d] === 1) {
							hm = 2
						}
					}
					if (hm !== 1) {
						continue
					}
					const bscore = bpss[i].get(bkey)
					if (bps[1] < bscore[1]) {
						bps = bscore
					}
				}
				bpss[i].set(key, bps)
			}
		}

		const sinkScores = new ArrayKeyMap()
		for (let k = 1; k < 2 ** this._n; k++) {
			const key = k
				.toString(2)
				.padStart(this._n, '0')
				.split('')
				.map(v => +v)
			const m = key.reduce((s, v) => s + v, 0)
			let sink = [null, -Infinity]
			for (let i = 0; i < bpss.length; i++) {
				let score = bpss[i].get(key)?.[1]
				if (!score) {
					continue
				}
				if (m > 1) {
					const ki = key.concat()
					ki[i] = 0
					score += sinkScores.get(ki)[1]
				}
				if (score > sink[1]) {
					sink = [i, score]
				}
			}

			sinkScores.set(key, sink)
		}

		const v = Array(this._n).fill(1)
		const order = []
		for (let i = 0; i < this._n; i++) {
			const k = sinkScores.get(v)[0]
			order[i] = k
			v[k] = 0
		}

		this._graph = []
		for (let i = order.length - 1; i >= 0; i--) {
			v[order[i]] = 1
			const k = bpss[order[i]].get(v)[0]
			const idx = []
			for (let j = 0; j < k.length; j++) {
				if (k[j] && j !== order[i]) {
					idx.push(j)
				}
			}
			this._graph[order[i]] = idx
		}
	}

	_score(x, graph = this._graph, cand = this._cand) {
		if (this._score_method === 'bdeu') {
			return this._bdeu(x, graph, cand)
		}
	}

	_bdeu(x, graph = this._graph, cand = this._cand, exact = false) {
		if (exact) {
			return this._logBDeu_exact(x, graph, cand)
		}
		return this._logBDeu_appro(x, graph, cand)
	}

	_logBDeu_exact(x, graph = this._graph, cand = this._cand) {
		const n = this._count(x, graph, cand)
		let logs = 0
		for (let i = 0; i < n.length; i++) {
			for (const k of n[i].keys()) {
				const tl = n[i].get(k)
				for (let j = 0; j < tl.length; j++) {
					const a = this._ess / (n[i].size * tl.length)
					logs += logGamma(a + tl[j])
					logs -= logGamma(a)
				}
				const sn = tl.reduce((s, v) => s + v, 0)
				const sa = this._ess / n[i].size
				logs += logGamma(sa)
				logs -= logGamma(sa + sn)
			}
		}
		return logs
	}

	_logBDeu_appro(x, graph = this._graph, cand = this._cand) {
		const n = this._count(x, graph, cand)
		let logs = 0
		for (let i = 0; i < n.length; i++) {
			logs += this._ess * Math.log(this._cand[i].length)
		}
		for (let i = 0; i < n.length; i++) {
			for (const k of n[i].keys()) {
				const tl = n[i].get(k)
				const sa = this._ess / n[i].size
				const sn = tl.reduce((s, v) => s + v, 0)
				for (let j = 0; j < tl.length; j++) {
					const a = this._ess / (n[i].size * tl.length)
					logs += (a + tl[j]) * Math.log((a + tl[j]) / (sa + sn))
					logs -=
						(((tl.length - 1) / tl.length) * Math.log(1 + (tl.length * n[i].size * tl[j]) / this._ess)) / 2
				}
			}
		}
		return logs
	}

	_fitParameter(x) {
		this._th = this._count(x)
		for (let i = 0; i < this._th.length; i++) {
			for (const k of this._th[i].keys()) {
				const a = this._th[i].get(k)
				const s = a.reduce((s, v) => s + v, 0)
				this._th[i].set(
					k,
					a.map(v => (this._alpha + v) / (this._alpha * a.length + s))
				)
			}
		}
	}

	_count(x, graph = this._graph, cand = this._cand) {
		const n = []
		for (let i = 0; i < graph.length; i++) {
			const cidx = x.map(v => cand[i].indexOf(v[i]))
			n[i] = new ArrayKeyMap()
			const p = Array(graph[i].length).fill(0)
			do {
				const m = Array(cand[i].length).fill(0)
				for (let t = 0; t < x.length; t++) {
					if (graph[i].some((j, k) => cand[j][p[k]] !== x[t][j])) {
						continue
					}
					m[cidx[t]]++
				}
				n[i].set(p.concat(), m)

				for (let k = 0; k < p.length; k++) {
					p[k]++
					if (p[k] < cand[graph[i][k]].length) {
						break
					}
					p[k] = 0
				}
			} while (p.reduce((s, v) => s + v, 0) > 0)
		}
		return n
	}

	/**
	 * Returns probability values.
	 * @param {Array<Array<*>>} x
	 * @returns {number[]}
	 */
	probability(x) {
		return x.map(r => {
			const idx = r.map((v, d) => this._cand[d].indexOf(v))
			let p = 1
			for (let i = 0; i < this._graph.length; i++) {
				const key = this._graph[i].map(d => idx[d])
				p *= this._th[i].get(key)[idx[i]]
			}
			return p
		})
	}
}
