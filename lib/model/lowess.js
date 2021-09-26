import { Matrix } from '../util/math.js'

/**
 * Locally weighted scatter plot smooth
 */
export default class LOWESS {
	// https://en.wikipedia.org/wiki/Local_regression
	// https://github.com/arokem/lowess
	constructor() {
		this._k = (a, b) => {
			const d = a.copySub(b)
			d.map(v => v * v)
			const s = d.sum(1)
			s.map(v => (v <= 1 ? (1 - Math.sqrt(v) ** 3) ** 3 : 0))
			return s
		}
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		this._x = Matrix.fromArray(x)
		this._b = this._x.resize(this._x.rows, this._x.cols + 1, 1)
		this._y = Matrix.fromArray(y)
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const pred = []
		for (let i = 0; i < x.rows; i++) {
			const xi = x.row(i)
			const w = this._k(this._x, xi)
			const bw = this._b.copyMult(w)

			const p = bw.tDot(this._b).solve(bw.tDot(this._y))
			pred.push(xi.resize(xi.rows, xi.cols + 1, 1).dot(p).value)
		}
		return pred
	}
}
