import Matrix from '../util/matrix.js'

/**
 * Adaptive Linear Neuron model
 */
export default class ADALINE {
	// https://qiita.com/ruka38/items/2f2f958c1d45728ea577
	// https://qiita.com/kazukiii/items/958fa06079a0e5a73007
	/**
	 * @param {number} rate Learning rate
	 */
	constructor(rate) {
		this._r = rate
		this._a = x => x

		this._w = null
		this._b = 0
	}

	/**
	 * Fit this model once.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		if (!this._w) {
			this._w = Matrix.randn(x[0].length, 1)
		}
		x = Matrix.fromArray(x)
		const o = x.dot(this._w)
		o.map(v => this._a(v + this._b))

		const e = Matrix.sub(Matrix.fromArray(y), o)
		const dw = x.tDot(e)
		dw.mult(this._r / x.rows)
		this._w.add(dw)
		this._b += (e.sum() * this._r) / x.rows
	}

	/**
	 * Returns predicted datas.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {Array<1 | -1>} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		return x.dot(this._w).value.map(v => (this._a(v + this._b) <= 0 ? -1 : 1))
	}
}
