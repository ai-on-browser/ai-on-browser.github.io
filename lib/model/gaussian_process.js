import { Matrix } from '../util/math.js'

/**
 * Gaussian process
 */
export default class GaussianProcess {
	// https://qiita.com/ctgk/items/4c4607edf15072cddc46
	/**
	 * @param {'gaussian'} [kernel='gaussian']
	 * @param {number} [beta=1]
	 */
	constructor(kernel = 'gaussian', beta = 1) {
		if (kernel === 'gaussian') {
			this._kernel = new GaussianKernel()
		}
		this._beta = beta
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	init(x, y) {
		const n = x.length
		this._x = []
		for (let i = 0; i < n; i++) {
			this._x.push(x[i])
		}
		this._t = new Matrix(y.length, 1, y)
		this._k = new Matrix(n, n)
	}

	/**
	 * Fit model.
	 * @param {number} learning_rate
	 */
	fit(learning_rate = 0.1) {
		const n = this._x.length
		for (let i = 0; i < n; i++) {
			this._k.set(i, i, this._kernel.calc(this._x[i], this._x[i]) + 1 / this._beta)
			for (let j = 0; j < i; j++) {
				const v = this._kernel.calc(this._x[i], this._x[j])
				this._k.set(i, j, v)
				this._k.set(j, i, v)
			}
		}

		this._prec_t = this._k.solve(this._t)

		const grads = [new Matrix(n, n), new Matrix(n, n)]
		for (let i = 0; i < n; i++) {
			for (let j = 0; j <= i; j++) {
				const v = this._kernel.derivatives(this._x[i], this._x[j])
				for (let k = 0; k < v.length; k++) {
					grads[k].set(i, j, v[k])
					grads[k].set(j, i, v[k])
				}
			}
		}

		const t_prec = this._prec_t.t

		const upds = grads.map(g => {
			const tr = this._k.solve(g).trace()
			const d = -tr + t_prec.dot(g).dot(this._prec_t).trace()
			return d * learning_rate
		})

		this._kernel.update(...upds)
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		const c = this._t.cols
		const m = Matrix.zeros(x.length, c)
		for (let i = 0; i < x.length; i++) {
			const xi = x[i]
			for (let j = 0; j < this._x.length; j++) {
				const v = this._kernel.calc(xi, this._x[j])
				for (let k = 0; k < c; k++) {
					m.addAt(i, k, v * this._prec_t.at(j, k))
				}
			}
		}
		return m.toArray()
	}
}

class GaussianKernel {
	constructor() {
		this._a = 0
		this._b = 1
	}

	calc(x, y) {
		let s = 0
		for (let i = 0; i < x.length; i++) {
			s += (x[i] - y[i]) ** 2
		}
		return Math.exp((-this._b / 2) * s) * this._a
	}

	derivatives(x, y) {
		let s = 0
		for (let i = 0; i < x.length; i++) {
			s += (x[i] - y[i]) ** 2
		}
		const da = Math.exp((-this._b / 2) * s)
		const db = (-1 / 2) * s * da * this._a
		return [da, db]
	}

	update(da, db) {
		this._a += da
		this._b += db
	}
}
