import { Matrix } from '../util/math.js'

/**
 * Lp norm linear regression
 */
export default class LpNormLinearRegression {
	// https://en.wikipedia.org/wiki/Iteratively_reweighted_least_squares
	/**
	 * @param {number} p
	 */
	constructor(p = 2) {
		this._p = p
		this._b = null
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)

		if (!this._w) {
			this._w = Matrix.ones(x.rows, 1)
		}

		const xtw = x.copyMult(this._w)
		this._b = xtw.tDot(x).solve(xtw.tDot(y))

		if (this._p - 2 !== 0) {
			const p = x.dot(this._b)
			const d = y.copySub(p)
			d.map(Math.abs)

			this._w = d.sum(1)
			if (this._p - 2 < 0) {
				this._w.map(v => Math.max(1.0e-8, v) ** (this._p - 2))
			} else {
				this._w.map(v => v ** (this._p - 2))
			}
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		return x.dot(this._b).toArray()
	}
}
