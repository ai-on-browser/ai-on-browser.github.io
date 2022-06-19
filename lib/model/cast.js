/**
 * Clustering Affinity Search Technique
 */
export default class CAST {
	// Clustering Gene Expression Patterns
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.34.5341&rep=rep1&type=pdf
	/**
	 * @param {number} t Affinity threshold
	 */
	constructor(t) {
		this._t = t
	}

	/**
	 * Number of clusters
	 *
	 * @type {number}
	 */
	get size() {
		return this._clusters.length
	}

	_similarity(a, b) {
		return Math.exp(-a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0))
	}

	_add(u, a, co, s) {
		while (true) {
			let max_a = -Infinity
			let max_i = -1
			for (let k = 0; k < u.length; k++) {
				if (a[u[k]] > max_a) {
					max_a = a[u[k]]
					max_i = k
				}
			}
			if (max_a < this._t * co.length) {
				return
			}

			for (const coi of co) {
				a[coi] += s[coi][u[max_i]]
			}
			for (const ui of u) {
				a[ui] += s[ui][u[max_i]]
			}

			co.push(u[max_i])
			u.splice(max_i, 1)
		}
	}

	_remove(u, a, co, s) {
		while (true) {
			let min_a = Infinity
			let min_i = -1
			for (let k = 0; k < co.length; k++) {
				if (a[co[k]] < min_a) {
					min_a = a[co[k]]
					min_i = k
				}
			}
			if (min_a >= this._t * co.length) {
				return
			}

			for (const coi of co) {
				a[coi] += s[coi][u[min_i]]
			}
			for (const ui of u) {
				a[ui] += s[ui][u[min_i]]
			}

			u.push(co[min_i])
			co.splice(min_i, 1)
		}
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const n = datas.length
		const s = []
		const u = Array.from({ length: n }, (_, i) => i)
		for (let i = 0; i < n; i++) {
			s[i] = []
		}
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				s[i][j] = s[j][i] = this._similarity(datas[i], datas[j])
			}
		}

		this._clusters = []
		while (u.length > 0) {
			const a = Array(n).fill(0)
			const co = []
			let last_co

			do {
				last_co = co.concat()
				this._add(u, a, co, s)
				this._remove(u, a, co, s)

				co.sort()
			} while (last_co.length !== co.length || last_co.some((v, i) => v !== co[i]))

			this._clusters.push(co)
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number[]} Predicted values
	 */
	predict() {
		const categories = []
		for (let k = 0; k < this._clusters.length; k++) {
			for (const i of this._clusters[k]) {
				categories[i] = k
			}
		}
		return categories
	}
}
