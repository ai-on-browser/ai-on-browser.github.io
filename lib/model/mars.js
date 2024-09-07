import Matrix from '../util/matrix.js'

class Term {
	constructor(s = [], t = [], v = []) {
		this._s = s
		this._t = t
		this._v = v
	}

	prod(s, t, v) {
		return new Term(this._s.concat(s), this._t.concat(t), this._v.concat(v))
	}

	calc(x) {
		let val = 1
		for (let i = 0; i < this._s.length; i++) {
			val *= Math.max(0, this._s[i] * (x[this._v[i]] - this._t[i]))
		}
		return val
	}
}

/**
 * Multivariate Adaptive Regression Splines
 */
export default class MultivariateAdaptiveRegressionSplines {
	// Multivariate Adaptive Regression Splines
	// https://www.slac.stanford.edu/pubs/slacpubs/4750/slac-pub-4960.pdf
	// https://en.wikipedia.org/wiki/Multivariate_adaptive_regression_spline
	/**
	 * @param {number} mmax Maximum number of terms
	 */
	constructor(mmax) {
		this._mmax = mmax
		this._b = [new Term()]
		this._a = null
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		const n = x.length
		const d = x[0].length
		y = Matrix.fromArray(y)

		let z = Matrix.ones(n, 1)
		let best_lof = Infinity
		let best_w = null
		while (this._b.length <= this._mmax) {
			let best_term = null
			let best_z = null
			for (let m = 0; m < this._b.length; m++) {
				for (let v = 0; v < d; v++) {
					for (let i = 0; i < n; i++) {
						if (this._b[m].calc(x[i]) === 0) continue
						const t = x[i][v]
						const termp = this._b[m].prod(1, t, v)
						const termm = this._b[m].prod(-1, t, v)
						const z1 = Matrix.resize(z, n, z.cols + 2)

						for (let j = 0; j < n; j++) {
							z1.set(j, z1.cols - 2, termp.calc(x[j]))
							z1.set(j, z1.cols - 1, termm.calc(x[j]))
						}

						const w = z1.tDot(z1).solve(z1.tDot(y))
						const yt = z1.dot(w)
						yt.sub(y)
						const e = yt.norm()
						if (e < best_lof) {
							best_term = { m, v, t }
							best_z = z1
							best_w = w
							best_lof = e
						}
					}
				}
			}

			this._b.push(
				this._b[best_term.m].prod(1, best_term.t, best_term.v),
				this._b[best_term.m].prod(-1, best_term.t, best_term.v)
			)
			z = best_z
			this._a = best_w
		}

		let best_w_b = this._b
		let best_k = z
		let best_k_b = this._b
		for (let i = this._b.length - 1; i >= 1; i--) {
			let b = Infinity
			const l = best_k
			const l_b = best_k_b
			for (let m = 1; m <= i; m++) {
				const z1 = l.copy()
				z1.remove(m, 1)
				const w = z1.tDot(z1).solve(z1.tDot(y))
				const yt = z1.dot(w)
				yt.sub(y)
				const e = yt.norm()

				if (e < b) {
					b = e
					best_k = z1
					best_k_b = l_b.concat()
					best_k_b.splice(m, 1)
				}
				if (e < best_lof) {
					best_lof = e
					best_w = w
					best_w_b = l_b.concat()
					best_w_b.splice(m, 1)
				}
			}
		}
		this._a = best_w
		this._b = best_w_b
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const n = x.length
		const z = Matrix.ones(n, this._b.length)
		for (let i = 0; i < n; i++) {
			for (let m = 0; m < this._b.length; m++) {
				z.set(i, m, this._b[m].calc(x[i]))
			}
		}
		return z.dot(this._a).toArray()
	}
}
