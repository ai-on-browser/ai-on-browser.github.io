import { Matrix } from '../util/math.js'

class GaussianKernel {
	constructor(a = 1.0, b = 1.0, e = 0.1) {
		this._a = a
		this._b = b
		this._e = e
	}

	_calc(x0, x1) {
		const s = x0.copySub(x1).reduce((acc, v) => acc + v * v, 0)
		return this._a * Math.exp(-s / (2 * this._b))
	}

	_grad(x0, x1, k) {
		const g = x0.copySub(x1)
		g.mult((-this._a * k) / this._b)
		return g
	}

	calc(x, y) {
		if (!y) {
			y = x
		}
		const n = x.rows
		const m = y.rows
		const K = new Matrix(n, m)
		for (let i = 0; i < n; i++) {
			const xi = x.row(i)
			for (let j = 0; j < m; j++) {
				const v = this._calc(xi, y.row(j))
				K.set(i, j, v)
			}
		}
		return K
	}

	grad(x, k) {
		const n = x.rows
		const d = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			const xi = x.row(i)
			for (let j = 0; j < n; j++) {
				const v = this._grad(xi, x.row(j), k.at(i, j))
				d.set(i, j, v.value)
			}
		}
		return d
	}

	update(x, k, G) {
		if (this._e === 0) {
			return
		}
		const n = x.rows
		const d = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			const xi = x.row(i)
			for (let j = 0; j < n; j++) {
				const di = xi.copySub(x.row(j))
				di.map(v => v ** 2)
				const s = -(this._a * di.sum()) / (2 * this._b ** 2)
				d.set(i, j, s * k.at(i, j))
			}
		}
		const dsig = G.copyMult(d.t).sum()
		this._b = Math.exp(Math.log(this._b) + (this._e / n) * dsig)
		if (this._b === 0) {
			this._b = 1.0e-8
		}
	}
}

/**
 * Gaussian Process Latent Variable Model
 */
export default class GPLVM {
	// https://qiita.com/student-i/items/328030426fa42b6010f9
	// https://cmbnur.com/?p=1621
	// https://ayatoashihara.github.io/my_blog/post/post9/
	/**
	 * @param {number} rd
	 * @param {number} alpha
	 * @param {number} [ez=1.0]
	 * @param {number} [ea=0.005]
	 * @param {number} [ep=0.2]
	 * @param {'gaussian'} [kernel='gaussian']
	 * @param {*[]} [kernelArgs]
	 */
	constructor(rd, alpha, ez = 1, ea = 0.005, ep = 0.2, kernel = 'gaussian', kernelArgs = []) {
		this._rd = rd
		this._alpha = alpha
		if (kernel === 'gaussian') {
			this._kernel = new GaussianKernel(...kernelArgs, ep)
		}
		this._ez = ez
		this._ea = ea
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x
	 */
	init(x) {
		this._x = Matrix.fromArray(x)
		this._z = Matrix.randn(x.length, this._rd, 0, 0.01)

		this._s = this._x.dot(this._x.t)
	}

	/**
	 * Fit model.
	 */
	fit() {
		const n = this._x.rows

		const ker = this._kernel.calc(this._z)
		const K = ker.copyAdd(Matrix.eye(n, n, this._alpha))
		const Kinv = K.inv()
		const G = Kinv.dot(this._s).dot(Kinv)
		G.sub(Kinv.copyMult(this._x.cols))
		G.div(2)

		const dK = this._kernel.grad(this._z, K)
		const dz = new Matrix(n, this._rd)
		for (let i = 0; i < n; i++) {
			const dzi = Matrix.zeros(1, this._rd)
			for (let j = 0; j < n; j++) {
				const v = new Matrix(1, this._rd, dK.at(i, j))
				v.mult(G.at(i, j))
				dzi.add(v)
			}
			dz.set(i, 0, dzi)
		}
		dz.mult(this._ez / n)

		this._kernel.update(this._z, ker, G)

		this._z.add(dz)
		this._alpha = Math.exp(Math.log(this._alpha) + (this._ea / n) * G.trace() * this._alpha)
	}

	/**
	 * Returns log likelihood.
	 * @returns {number}
	 */
	llh() {
		const n = this._x.rows
		const ker = this._kernel.calc(this._z)
		const K = ker.copyAdd(Matrix.eye(n, n, this._alpha))
		return (
			(-this._x.length * Math.log(2 * Math.PI)) / 2 -
			(this._x.cols * Math.log(K.det())) / 2 -
			(this._x.cols * K.solve(this._s).trace()) / 2
		)
	}

	/**
	 * Returns reduced datas.
	 * @returns {Array<Array<number>>}
	 */
	predict() {
		return this._z.toArray()
	}

	/**
	 * Returns reconstruct datas.
	 * @param {Array<Array<number>>} z
	 * @returns {Array<Array<number>>}
	 */
	reconstruct(z) {
		z = Matrix.fromArray(z)
		const n = this._z.rows
		const K = this._kernel.calc(this._z)
		const Ka = K.copyAdd(Matrix.eye(n, n, this._alpha))
		const ks = this._kernel.calc(z, this._z)
		return ks.dot(Ka.solve(this._x)).toArray()
	}
}
