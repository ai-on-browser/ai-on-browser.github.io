import Matrix from '../util/matrix.js'

/**
 * Conscience on-line learning
 */
export default class COLL {
	// A Conscience On-line Learning Approach for Kernel-Based Clustering
	// https://03e7422d-a-62cb3a1a-s-sites.googlegroups.com/site/sunnycdwhl/2010_ICDM_Wang_COLL.pdf
	/**
	 * @param {number} c Number of clusters
	 * @param {number} [eta=1] Initial learning rate
	 * @param {'gaussian' | 'polynomial' | function (number[], number[]): number} [kernel=gaussian] Kernel name
	 */
	constructor(c, eta = 1, kernel = 'gaussian') {
		this._c = c
		this._eta = eta
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			switch (kernel) {
				case 'gaussian':
					this._s = 1
					this._kernel = (a, b) =>
						Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / this._s ** 2)
					break
				case 'polynomial':
					this._d = 2
					this._kernel = (a, b) => (1 + a.reduce((s, v, i) => s + v * b[i])) ** this._d
					break
			}
		}
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._datas = datas
		const n = datas.length
		this._k = []
		this._nu = []
		this._t = 0

		this._nk = Array(this._c).fill(0)
		for (let i = 0; i < n; i++) {
			this._nu[i] = Math.floor(Math.random() * this._c)
			this._nk[this._nu[i]]++

			this._k[i] = []
			this._k[i][i] = this._kernel(datas[i], datas[i])
			for (let j = 0; j < i; j++) {
				this._k[i][j] = this._k[j][i] = this._kernel(datas[i], datas[j])
			}
		}
		this._f = this._nk.map(v => v / n)
		const A = Matrix.zeros(this._c, n)
		for (let i = 0; i < n; i++) {
			A.set(this._nu[i], i, 1 / this._nk[this._nu[i]])
		}
		const K = Matrix.fromArray(this._k)
		const AK = A.dot(K)
		this._w = new Matrix(this._c, n + 1)
		this._w.set(0, 0, AK)
		for (let k = 0; k < this._c; k++) {
			let v = 0
			for (let i = 0; i < n; i++) {
				v += AK.at(k, i) * A.at(k, i)
			}
			this._w.set(k, n, v)
		}
	}

	/**
	 * Fit model once.
	 *
	 * @returns {number} Convergence criterion
	 */
	fit() {
		const n = this._datas.length
		const pi = Array.from({ length: this._c }, () => [])
		const idx = Array.from({ length: n }, (_, i) => i)
		for (let i = idx.length - 1; i > 0; i--) {
			const r = Math.floor(Math.random() * (i + 1))
			;[idx[i], idx[r]] = [idx[r], idx[i]]
		}
		this._t++
		const eta = this._eta / this._t

		for (let l = 0; l < n; l++) {
			const i = idx[l]
			let min_nu = -1
			let min_v = Infinity
			for (let k = 0; k < this._c; k++) {
				const v = this._f[k] * (this._k[i][i] + this._w.at(k, n) - 2 * this._w.at(k, i))
				if (v < min_v) {
					min_v = v
					min_nu = k
				}
			}
			this._nu[i] = min_nu
			pi[min_nu].push(i)
			for (let j = 0; j < n; j++) {
				this._w.set(min_nu, j, (1 - eta) * this._w.at(min_nu, j) + eta * this._k[i][j])
			}
			this._w.set(
				min_nu,
				n,
				(1 - eta) ** 2 * this._w.at(min_nu, n) +
					eta ** 2 * this._k[i][i] +
					2 * (1 - eta) * eta * this._w.at(min_nu, i)
			)
			this._nk[min_nu] += 1
			const sumn = this._nk.reduce((s, v) => s + v, 0)
			this._f = this._nk.map(v => v / sumn)
		}

		if (eta === 1) {
			return Infinity
		}
		let err = 0
		for (let k = 0; k < this._c; k++) {
			err += (1 - 1 / (1 - eta) ** pi[k].length) ** 2 * this._w.at(k, n)
			for (let h = 0; h < pi[k].length; h++) {
				for (let l = 0; l < pi[k].length; l++) {
					err += (eta ** 2 * this._k[pi[k][h]][pi[k][l]]) / (1 - eta) ** (h + l)
				}
			}
			const s = 2 * eta * (1 - 1 / (1 - eta) ** pi[k].length)
			for (let l = 0; l < pi[k].length; l++) {
				err += (s * this._w.at(k, pi[k][l])) / (1 - eta) ** l
			}
		}
		return err
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._nu
	}
}
