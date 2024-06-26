import Matrix from '../util/matrix.js'

/**
 * Generative topographic mapping
 */
export default class GTM {
	// https://datachemeng.com/generativetopographicmapping/
	// https://github.com/hkaneko1985/dcekit
	/**
	 * @param {number} input_size Input size
	 * @param {number} output_size Output size
	 * @param {number} [k] Grid size
	 * @param {number} [q] Grid size for basis function
	 */
	constructor(input_size, output_size, k = 20, q = 10) {
		this.in_size = input_size
		this.out_size = output_size

		this._k = k
		this._lambda = 0.001
		this._w = null
		this._b = 1

		this._init_method = 'PCA'
		this._fit_method = 'mean'

		this._epoch = 0
		this._z = this._make_grid(Array(output_size).fill(this._k))
		this._t = this._make_grid(Array(output_size).fill(q))
	}

	_make_grid(n) {
		const g = []
		const g0 = Array(n.length).fill(0)
		do {
			g.push(g0.map((v, i) => (2 * v) / (n[i] - 1) - 1))
			for (let i = n.length - 1; i >= 0; i--) {
				g0[i]++
				if (g0[i] < n[i]) break
				g0[i] = 0
			}
		} while (g0.reduce((a, v) => a + v, 0) > 0)
		return g
	}

	_phi(z, i = null, s = Math.SQRT2) {
		if (i === null) {
			const p = []
			for (let k = 0; k < this._t.length; k++) {
				p.push(this._phi(z, k, s))
			}
			return p
		}
		return Math.exp(-this._t[i].reduce((a, v, k) => a + (v - z[k]) ** 2, 0) / (2 * s ** 2))
	}

	_prob(x, z) {
		const probs = []
		const phi = Matrix.fromArray(this._phi(z))
		const phiw = phi.tDot(this._w).value
		const c = (this._b / (2 * Math.PI)) ** (x[0].length / 2)
		for (let n = 0; n < x.length; n++) {
			const norm = phiw.reduce((s, v, k) => s + (v - x[n][k]) ** 2, 0)
			probs[n] = c * Math.exp((-this._b * norm) / 2)
		}
		return probs
	}

	/**
	 * Returns probabilities.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	probability(x) {
		const probs = Array(x.length).fill(0)
		for (let i = 0; i < this._z.length; i++) {
			const p = this._prob(x, this._z[i])
			for (let k = 0; k < p.length; k++) {
				probs[k] += p[k]
			}
		}
		return probs.map(v => v / this._z.length)
	}

	/**
	 * Returns responsibility.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Matrix} Responsibility
	 */
	responsibility(x) {
		const r = new Matrix(x.length, this._z.length)
		for (let k = 0; k < this._z.length; k++) {
			const p = this._prob(x, this._z[k])
			for (let i = 0; i < p.length; i++) {
				r.set(i, k, p[i])
			}
		}
		const rsum = r.sum(1)
		for (let i = 0; i < x.length; i++) {
			if (rsum.at(i, 0) === 0) {
				rsum.set(i, 0, 1)
				for (let k = 0; k < this._z.length; k++) {
					r.set(i, k, 1 / this._z.length)
				}
			}
		}
		r.div(rsum)
		return r
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} data Training data
	 */
	fit(data) {
		const x = data
		const n = x.length
		const dim = this.in_size
		if (!this._w) {
			if (this._init_method === 'random') {
				this._w = Matrix.randn(this._t.length, dim)
			} else if (this._init_method === 'PCA') {
				const x0 = new Matrix(n, dim, data)
				const xd = x0.cov()
				const [l, pca] = xd.eigen()
				const expl = new Matrix(
					1,
					l.length,
					l.map(v => Math.sqrt(v))
				)
				expl.repeat(this._t.length, 0)
				expl.mult(x0.block(0, 0, this._t.length, l.length))
				this._w = expl.dot(pca.t)
			}
		}

		const r = this.responsibility(x)

		const phi = Matrix.fromArray(this._z.map(v => this._phi(v)))

		const pp = Matrix.mult(phi, r.sum(0).t).tDot(phi)
		pp.add(Matrix.eye(pp.cols, pp.cols, this._lambda / this._b))

		const xmat = Matrix.fromArray(x)
		const w1 = pp.solve(phi.tDot(r.tDot(xmat)))

		const d = new Matrix(n, this._z.length)
		const phiw = phi.dot(w1)
		for (let i = 0; i < n; i++) {
			const di = Matrix.sub(phiw, xmat.row(i))
			di.mult(di)
			d.set(i, 0, di.sum(1).t)
		}
		this._b = (n * dim) / Matrix.mult(r, d).sum()
		this._w = w1.slice(0, this._t.length)
		this._epoch++
	}

	/**
	 * Returns best indexes.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predictIndex(x) {
		return this.responsibility(x).argmax(1).value
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const r = this.responsibility(x)
		if (this._fit_method === 'mode') {
			return r.argmax(1).value.map(v => this._z[v])
		} else {
			r.div(r.sum(1))
			const p = []
			for (let i = 0; i < x.length; i++) {
				const v = Array(this._z[0].length).fill(0)
				for (let k = 0; k < this._z.length; k++) {
					for (let d = 0; d < v.length; d++) {
						v[d] += this._z[k][d] * r.at(i, k)
					}
				}
				p.push(v)
			}
			return p
		}
	}
}
