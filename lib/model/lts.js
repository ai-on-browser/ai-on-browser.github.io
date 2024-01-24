import Matrix from '../util/matrix.js'

/**
 * Least trimmed squares
 */
export default class LeastTrimmedSquaresRegression {
	// http://sfb649.wiwi.hu-berlin.de/fedc_homepage/xplore/tutorials/xaghtmlnode12.html
	/**
	 * @param {number} [h=0.9] Sampling rate
	 */
	constructor(h = 0.9) {
		this._w = null
		this._h = h
	}

	_ls(x, y) {
		const m = x.mean(0)
		x = Matrix.sub(x, m)
		const xtx = x.tDot(x)
		const w = xtx.solve(x.tDot(y))
		y = Matrix.sub(y, x.dot(w))
		const b = y.mean(0)
		return [w, m, b]
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)

		const [wls, mls, bls] = this._ls(x, y)
		const yls = Matrix.sub(x, mls).dot(wls)
		yls.add(bls)
		yls.sub(y)
		yls.mult(yls)

		const r = yls.sum(1).value.map((v, i) => [v, i])
		r.sort((a, b) => a[0] - b[0])

		const h = Math.max(1, Math.floor(r.length * this._h))

		const xlts = x.row(r.slice(0, h).map(v => v[1]))
		const ylts = y.row(r.slice(0, h).map(v => v[1]))

		;[this._w, this._m, this._b] = this._ls(xlts, ylts)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		x.sub(this._m)
		const y = x.dot(this._w)
		y.add(this._b)
		return y.toArray()
	}
}
