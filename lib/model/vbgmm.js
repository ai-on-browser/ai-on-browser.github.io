import Matrix from '../util/matrix.js'

class BigFract {
	constructor(n = 0n, d = 1n) {
		this._n = BigInt(n)
		this._d = BigInt(d)
	}

	_euclidean(a, b) {
		if (a === 0n || b === 0n) {
			if (a !== 0n) {
				return a
			} else if (b !== 0n) {
				return b
			}
			return 1n
		}
		a = a < 0 ? -a : a
		b = b < 0 ? -b : b
		if (a === b) {
			return a
		}
		if (a > b) {
			;[a, b] = [b, a]
		}
		while (true) {
			const q = b / a
			const r = b - q * a
			if (r === 0n) {
				return a
			}
			;[a, b] = [r, a]
		}
	}

	toFloat() {
		return Number(this._n) / Number(this._d)
	}

	add(o) {
		const n = this._n * o._d + o._n * this._d
		const d = this._d * o._d
		const r = this._euclidean(n, d)
		return new BigFract(n / r, d / r)
	}

	mult(o) {
		const n = this._n * o._n
		const d = this._d * o._d
		const r = this._euclidean(n, d)
		return new BigFract(n / r, d / r)
	}
}

const BigFract0 = new BigFract(0)
const B = [new BigFract(1), new BigFract(-1, 2), new BigFract(1, 6)]

const bernoulli = n => {
	if (n < 0) {
		throw 'Invalid bernoulli parameter'
	}
	if (B[n]) {
		return B[n]
	}
	if (n % 2 === 1 && n > 1) {
		return (B[n] = BigFract0)
	}
	let b = new BigFract(1).mult(B[0])
	for (let i = 1; i < n; i++) {
		let nu = 1n
		let de = 1n
		for (let t = 0n; t < i; t++) {
			nu *= BigInt(n + 1) - t
			de *= t + 1n
		}
		b = b.add(new BigFract(nu, de).mult(bernoulli(i)))
	}
	return (B[n] = b.mult(new BigFract(-1, n + 1)))
}

/**
 * Variational Gaussian Mixture Model
 */
export default class VBGMM {
	// https://qiita.com/ctgk/items/49d07215f700ecb03eeb
	// https://chrofieyue.hatenadiary.org/entry/20111202/1322832021
	// https://openbook4.me/projects/261/sections/1648
	/**
	 * @param {number} a Tuning parameter
	 * @param {number} b Tuning parameter
	 * @param {number} k Initial number of clusters
	 */
	constructor(a, b, k) {
		this._a0 = a
		this._b0 = b
		this._k = k
	}

	/**
	 * Means
	 * @type {Matrix}
	 */
	get means() {
		return this._m
	}

	/**
	 * Covariances
	 * @type {Matrix[]}
	 */
	get covs() {
		return this._nu.value.map((n, i) => Matrix.mult(this._w[i], n).inv())
	}

	/**
	 * Effectivity
	 * @type {boolean[]}
	 */
	get effectivity() {
		return this._r.sum(0).value.map(v => v >= 1)
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
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
			const xi = Matrix.sub(this._x, m.row(i))
			const p = Matrix.mult(xi.dot(s[i].inv()), xi).sum(1)
			const dv = Math.sqrt(s[i].det() * (2 * Math.PI) ** d)
			p.map(v => Math.exp(-v / 2) / dv)
			this._r.set(0, i, p)
		}

		this._r.div(this._r.sum(1))
		this._r.map(v => (v < 1.0e-10 ? 1.0e-10 : v))
	}

	_digamma(z) {
		if (Number.isNaN(z)) {
			return z
		}
		const eulers_c = 0.5772156649
		if (z > 0 && Number.isInteger(z)) {
			let s = -eulers_c
			for (let i = 1; i < z; i++) {
				s += 1 / i
			}
			return s
		} else if (z > 0 && Number.isInteger(z - 0.5)) {
			let s = -eulers_c - 2 * Math.log(2)
			for (let i = 0; i < z - 1; i++) {
				s += 2 / (2 * i + 1)
			}
			return s
		}
		let s = 0
		if (z < 0) {
			s -= Math.PI / Math.tan(Math.PI * z)
			z = 1 - z
		}
		while (z < 10) {
			s -= 1 / z
			z += 1
		}
		s += Math.log(z) - 1 / (2 * z)
		let n = 1
		while (true) {
			const n2 = n * 2
			const d = this._bernoulli(n2) / (n2 * z ** n2)
			s -= d
			if (Math.abs(d / s) < 1.0e-12) {
				break
			}
			n += 1
		}
		return s
	}

	_bernoulli(n) {
		return bernoulli(n).toFloat()
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
			const xk = Matrix.sub(this._x, xbar.row(k))
			const s = Matrix.mult(xk, cr).tDot(xk)
			s.div(nk.value[k])
			sk.push(s)
		}

		const alpha = (this._p = Matrix.add(nk, this._a0))
		this._p.div(this._p.sum())
		const beta = Matrix.add(nk, this._b0)

		const r = Matrix.mult(this._m0, this._b0)
		const mk = (this._m = Matrix.add(Matrix.mult(xbar, nk.t), r))
		mk.div(beta.t)

		const w = (this._w = [])
		for (let k = 0; k < nc; k++) {
			const r = this._w0.inv()
			const nkk = nk.value[k]
			r.add(Matrix.mult(sk[k], nkk))

			const fact = (this._b0 * nkk) / (this._b0 + nkk)
			const diff = Matrix.sub(xbar.row(k), this._m0)
			r.add(Matrix.mult(diff.tDot(diff), fact))

			w.push(r.inv())
		}

		const nu = (this._nu = Matrix.add(nk, this._nu0))

		const ex_lpi = Matrix.map(alpha, v => this._digamma(v))
		ex_lpi.sub(this._digamma(alpha.sum()))
		const ex_log = Matrix.zeros(n, nc)
		for (let k = 0; k < nc; k++) {
			const nuk = nu.value[k]

			let ex_ll = d * Math.log(2) + Math.log(w[k].det())
			for (let i = 0; i < d; i++) {
				ex_ll += this._digamma((nuk - i) / 2)
			}

			const xk = Matrix.sub(this._x, mk.row(k))
			const ex_quad = Matrix.mult(xk.dot(w[k]), xk).sum(1)
			ex_quad.mult(nuk)
			ex_quad.add(d / beta.value[k])

			ex_quad.map(v => (ex_ll - d * Math.log(2 * Math.PI) - v) / 2)

			ex_log.set(0, k, ex_quad)
		}

		const lrho = Matrix.add(ex_log, ex_lpi)

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
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {Matrix} Predicted values
	 */
	probability(data) {
		const x = Matrix.fromArray(data)
		const covs = this.covs
		const p = new Matrix(x.rows, covs.length)
		for (let i = 0; i < covs.length; i++) {
			const d = Matrix.sub(x, this._m.row(i))
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
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		return this.probability(data).argmax(1).value
	}
}
