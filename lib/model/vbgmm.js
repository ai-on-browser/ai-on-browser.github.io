import Matrix from '../util/matrix.js'

/**
 * Variational Gaussian Mixture Model
 */
export default class VBGMM {
	// https://qiita.com/ctgk/items/49d07215f700ecb03eeb
	// https://chrofieyue.hatenadiary.org/entry/20111202/1322832021
	// https://openbook4.me/projects/261/sections/1648
	/**
	 * @param {number} a
	 * @param {number} b
	 * @param {number} k
	 */
	constructor(a, b, k) {
		this._a0 = a
		this._b0 = b
		this._k = k
	}

	/**
	 * Means
	 *
	 * @type {Matrix}
	 */
	get means() {
		return this._m
	}

	/**
	 * Covariances
	 *
	 * @type {Matrix[]}
	 */
	get covs() {
		return this._nu.value.map((n, i) => this._w[i].copyMult(n).inv())
	}

	/**
	 * Effectivity
	 *
	 * @type {boolean[]}
	 */
	get effectivity() {
		return this._r.sum(0).value.map(v => v >= 1)
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} datas
	 */
	init(datas) {
		this._x = Matrix.fromArray(datas)
		const n = this._x.rows
		const d = this._x.cols
		const variance = this._x.variance(0).mean()

		this._m0 = Matrix.zeros(1, d)
		this._w0 = Matrix.eye(d, d, 1 / variance)

		this._nu0 = 1

		const m = this._x.sample(this._k)[0]
		const s = []
		for (let i = 0; i < this._k; i++) {
			s.push(Matrix.eye(d, d, variance))
		}

		this._r = new Matrix(n, this._k)
		for (let i = 0; i < this._k; i++) {
			const xi = this._x.copySub(m.row(i))
			const p = xi.dot(s[i].inv()).copyMult(xi).sum(1)
			const dv = Math.sqrt(s[i].det() * (2 * Math.PI) ** d)
			p.map(v => Math.exp(-v / 2) / dv)
			this._r.set(0, i, p)
		}

		this._r.div(this._r.sum(1))
		this._r.map(v => (v < 1.0e-10 ? 1.0e-10 : v))
	}

	_digamma(z) {
		if (z <= 0) {
			throw 'Invalid digamma value'
		}
		const eulers_c = 0.5772156649
		let s = -eulers_c
		let n = 0
		while (true) {
			const v = (z - 1) / ((n + 1) * (z + n))
			if (Math.abs(v) < 1.0e-12) break
			s += v
			n++
		}
		return s
	}

	/**
	 * Fit model.
	 */
	fit() {
		const nk = this._r.sum(0)

		const xbar = this._r.tDot(this._x)
		xbar.div(nk.t)

		const nc = this._r.cols
		const d = this._x.cols
		const n = this._x.rows

		const sk = []
		for (let k = 0; k < nc; k++) {
			const cr = this._r.col(k)
			const xk = this._x.copySub(xbar.row(k))
			const s = xk.copyMult(cr).tDot(xk)
			s.div(nk.value[k])
			sk.push(s)
		}

		const alpha = (this._p = nk.copyAdd(this._a0))
		this._p.div(this._p.sum())
		const beta = nk.copyAdd(this._b0)

		const r = this._m0.copyMult(this._b0)
		const mk = (this._m = xbar.copyMult(nk.t).copyAdd(r))
		mk.div(beta.t)

		const w = (this._w = [])
		for (let k = 0; k < nc; k++) {
			const r = this._w0.inv()
			const nkk = nk.value[k]
			r.add(sk[k].copyMult(nkk))

			const fact = (this._b0 * nkk) / (this._b0 + nkk)
			const diff = xbar.row(k).copySub(this._m0)
			r.add(diff.tDot(diff).copyMult(fact))

			w.push(r.inv())
		}

		const nu = (this._nu = nk.copyAdd(this._nu0))

		const ex_lpi = alpha.copyMap(v => this._digamma(v))
		ex_lpi.sub(this._digamma(alpha.sum()))
		const ex_log = Matrix.zeros(n, nc)
		for (let k = 0; k < nc; k++) {
			const nuk = nu.value[k]

			let ex_ll = d * Math.log(2) + Math.log(w[k].det())
			for (let i = 0; i < d; i++) {
				ex_ll += this._digamma((nuk - i) / 2)
			}

			const xk = this._x.copySub(mk.row(k))
			const ex_quad = xk.dot(w[k]).copyMult(xk).sum(1)
			ex_quad.mult(nuk)
			ex_quad.add(d / beta.value[k])

			ex_quad.map(v => (ex_ll - d * Math.log(2 * Math.PI) - v) / 2)

			ex_log.set(0, k, ex_quad)
		}

		const lrho = ex_log.copyAdd(ex_lpi)

		const new_r = Matrix.zeros(n, nc)
		for (let i = 0; i < n; i++) {
			const lr = lrho.row(i)
			const lse = Math.log(lr.value.reduce((s, v) => s + Math.exp(v), 0))
			lr.sub(lse)
			new_r.set(i, 0, lr)
		}
		new_r.map(Math.exp)
		new_r.div(new_r.sum(1))
		new_r.map(v => (v < 1.0e-10 ? 1.0e-10 : v))

		this._r = new_r
	}

	/**
	 * Returns probability of the datas.
	 *
	 * @param {Array<Array<number>>} data
	 * @returns {Matrix}
	 */
	probability(data) {
		const x = Matrix.fromArray(data)
		const covs = this.covs
		const p = new Matrix(x.rows, covs.length)
		for (let i = 0; i < covs.length; i++) {
			const d = x.copySub(this._m.row(i))
			let g = d.dot(covs[i].inv())
			g.mult(d)
			g = g.sum(1)

			const dv = Math.sqrt(covs[i].det() * (2 * Math.PI) ** x.cols)
			g.map(v => Math.exp(-v / 2) / dv)
			p.set(0, i, g)
		}
		p.mult(this._p)
		return p
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} data
	 * @returns {number[]}
	 */
	predict(data) {
		return this.probability(data).argmax(1).value
	}
}
