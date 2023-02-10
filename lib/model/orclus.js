import Matrix from '../util/matrix.js'

/**
 * arbitrarily ORiented projected CLUSter generation
 */
export default class ORCLUS {
	// Finding Generalized Projected Clusters in High Dimensional Spaces
	// https://dl.acm.org/doi/pdf/10.1145/342009.335383
	/**
	 * @param {number} k Number of clusters
	 * @param {number} k0 Number of begining seeds
	 * @param {number} l Number of dimensions
	 */
	constructor(k, k0, l) {
		this._k = k
		this._k0 = k0
		this._l = l
		this._alpha = 0.5
		this._beta = null

		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_pdist(a, b, e) {
		return Math.sqrt(
			e.reduce(
				(s, ei) => s + (ei.reduce((s, v, d) => s + v * a[d], 0) - ei.reduce((s, v, d) => s + v * b[d], 0)) ** 2,
				0
			)
		)
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		this._x = datas
		const dim = this._x[0].length
		const idx = []
		for (let i = 0; i < this._k0; i++) {
			idx.push(Math.floor(Math.random() * (this._x.length - i)))
		}
		for (let i = idx.length - 1; i >= 0; i--) {
			for (let j = idx.length - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		this._s = idx.map(v => this._x[v])
		let lc = dim
		let kc = this._k0
		this._e = []
		for (let i = 0; i < kc; i++) {
			this._e[i] = []
			for (let d = 0; d < lc; d++) {
				this._e[i][d] = Array(dim).fill(0)
				this._e[i][d][d] = 1
			}
		}
		this._beta = Math.exp((-Math.log(dim / this._l) * Math.log(1 / this._alpha)) / Math.log(this._k0 / this._k))

		while (kc > this._k) {
			const [s, c] = this._assign()
			this._s = s
			for (let i = 0; i < kc; i++) {
				this._e[i] = this._findVectors(c[i], lc)
			}
			const knew = Math.max(this._k, kc * this._alpha)
			const lnew = Math.max(this._l, lc * this._beta)

			const [sn, , en] = this._merge(c, knew, lnew)
			this._s = sn
			this._e = en
			lc = lnew
			kc = this._s.length
		}
	}

	_assign() {
		const dim = this._x[0].length
		const c = Array.from(this._s, () => [])
		for (let i = 0; i < this._x.length; i++) {
			let min_d = Infinity
			let min_k = -1
			for (let k = 0; k < this._s.length; k++) {
				const d = this._pdist(this._x[i], this._s[k], this._e[k])
				if (d < min_d) {
					min_d = d
					min_k = k
				}
			}

			c[min_k].push(i)
		}
		const s = []
		for (let k = 0; k < c.length; k++) {
			s[k] = Array(dim).fill(0)
			for (let j = 0; j < c[k].length; j++) {
				for (let d = 0; d < dim; d++) {
					s[k][d] += this._x[c[k][j]][d]
				}
			}
			s[k] = s[k].map(v => v / c[k].length)
		}
		return [s, c]
	}

	_findVectors(c, q) {
		const d = this._x[0].length
		const m = Matrix.fromArray(c.map(v => this._x[v])).cov()
		const eigvec = m.eigenVectors()
		return eigvec.slice(d - Math.ceil(q), d, 1).t.toArray()
	}

	_merge(c, knew, lnew) {
		const dim = this._x[0].length
		const ed = Array.from(c, () => [])
		const sd = Array.from(c, () => [])
		const r = Array.from(c, () => [])
		for (let i = 0; i < c.length; i++) {
			for (let j = i + 1; j < c.length; j++) {
				const cij = c[i].concat(c[j])
				ed[i][j] = this._findVectors(cij, lnew)
				sd[i][j] = Array(dim).fill(0)
				for (let k = 0; k < cij.length; k++) {
					for (let d = 0; d < dim; d++) {
						sd[i][j][d] += this._x[cij[k]][d]
					}
				}
				sd[i][j] = sd[i][j].map(v => v / cij.length)
				r[i][j] = 0
				for (let k = 0; k < cij.length; k++) {
					r[i][j] += this._pdist(this._x[cij[k]], sd[i][j], ed[i][j]) ** 2
				}
				r[i][j] /= cij.length
			}
		}

		c = c.concat()
		const s = this._s.concat()
		const e = this._e.concat()
		while (s.length > knew) {
			let id = -1
			let jd = -1
			let min_r = Infinity
			for (let i = 0; i < r.length; i++) {
				for (let j = i + 1; j < r.length; j++) {
					if (r[i][j] < min_r) {
						min_r = r[i][j]
						id = i
						jd = j
					}
				}
			}
			s[id] = sd[id][jd]
			c[id] = c[id].concat(c[jd])
			e[id] = ed[id][jd]
			s.splice(jd, 1)
			c.splice(jd, 1)
			e.splice(jd, 1)

			sd.splice(jd, 1)
			ed.splice(jd, 1)
			r.splice(jd, 1)
			for (let i = 0; i < s.length; i++) {
				sd[i].splice(jd, 1)
				ed[i].splice(jd, 1)
				r[i].splice(jd, 1)
				if (i !== id) {
					const il = i < id ? i : id
					const ih = i < id ? id : i
					const cij = c[il].concat(c[ih])
					ed[il][ih] = this._findVectors(cij, lnew)
					sd[il][ih] = Array(dim).fill(0)
					for (let k = 0; k < cij.length; k++) {
						for (let d = 0; d < dim; d++) {
							sd[il][ih][d] += this._x[cij[k]][d]
						}
					}
					sd[il][ih] = sd[il][ih].map(v => v / cij.length)
					r[il][ih] = 0
					for (let k = 0; k < cij.length; k++) {
						r[il][ih] += this._pdist(this._x[cij[k]], sd[il][ih], ed[il][ih]) ** 2
					}
					r[il][ih] /= cij.length
				}
			}
		}

		return [s, c, e]
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const p = []
		for (let i = 0; i < datas.length; i++) {
			let min_d = Infinity
			let min_k = -1
			for (let k = 0; k < this._s.length; k++) {
				const d = this._pdist(datas[i], this._s[k], this._e[k])
				if (d < min_d) {
					min_d = d
					min_k = k
				}
			}
			p[i] = min_k
		}
		return p
	}
}
