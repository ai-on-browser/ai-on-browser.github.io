import Matrix from '../util/matrix.js'

/**
 * Lagrange interpolation
 */
export default class LagrangeInterpolation {
	// https://ja.wikipedia.org/wiki/%E3%83%A9%E3%82%B0%E3%83%A9%E3%83%B3%E3%82%B8%E3%83%A5%E8%A3%9C%E9%96%93
	/**
	 * @param {'weighted' | 'newton' | ''} [method] Method name
	 */
	constructor(method = 'weighted') {
		this._method = method
		this._w_type = 2
	}

	/**
	 * Fit model.
	 * @param {number[]} x Training data
	 * @param {number[]} y Target values
	 */
	fit(x, y) {
		this._x = x
		this._y = y
	}

	/**
	 * Returns predicted interpolated values.
	 * @param {number[]} target Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(target) {
		if (this._method === 'weighted') {
			return this._weighted(target)
		} else if (this._method === 'newton') {
			return this._newton(target)
		}
		const x = this._x
		const y = this._y
		return target.map(t => {
			return x.reduce((s, d, j) => {
				return (
					s +
					y[j] *
						x.reduce((p, v, m) => {
							return j === m ? p : (p * (t - v)) / (d - v)
						}, 1)
				)
			}, 0)
		})
	}

	_weighted(target) {
		const x = this._x
		const y = this._y
		const w = x.map((d, j) => 1 / x.reduce((p, v, i) => (i === j ? p : p * (d - v)), 1))
		if (this._w_type === 1) {
			return target.map(t => {
				let l = 1
				let v = 0
				for (let i = 0; i < x.length; i++) {
					if (t === x[i]) {
						return y[i]
					}
					l *= t - x[i]
					v += (y[i] * w[i]) / (t - x[i])
				}
				return l * v
			})
		} else {
			return target.map(t => {
				let n = 0,
					m = 0
				x.forEach((v, j) => {
					const d = w[j] / (t - v + 1.0e-8)
					m += d
					n += y[j] * d
				})
				return n / m
			})
		}
	}

	_newton(target) {
		const x = this._x
		const y = this._y
		const n = x.length
		const m = target.length
		const w = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			w.set(i, 0, 1)
		}
		for (let j = 1; j < n; j++) {
			for (let i = j; i < n; i++) {
				w.set(i, j, w.at(i, j - 1) * (x[i] - x[j - 1]))
			}
		}
		const b = new Matrix(n, 1, y)
		const a = w.solve(b)

		const t = new Matrix(m, n)
		for (let i = 0; i < m; i++) {
			t.set(i, 0, 1)
		}
		target = new Matrix(m, 1, target)
		for (let j = 1; j < n; j++) {
			t.set(0, j, Matrix.mult(t.col(j - 1), Matrix.sub(target, x[j - 1])))
		}
		return t.dot(a).value
	}
}
