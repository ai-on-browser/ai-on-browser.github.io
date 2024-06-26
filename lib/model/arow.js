import Matrix from '../util/matrix.js'

/**
 * Adaptive regularization of Weight Vectors
 */
export default class AROW {
	// http://kazoo04.hatenablog.com/entry/2012/12/20/000000
	/**
	 * @param {number} r Learning rate
	 */
	constructor(r = 0.1) {
		this._m = null
		this._s = null
		this._r = r
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._c = this._x.mean(0)
		this._x.sub(this._c)
		this._y = train_y

		this._d = this._x.cols
		this._m = Matrix.zeros(this._d, 1)
		this._s = Matrix.eye(this._d, this._d)
	}

	/**
	 * Update model parameters with one data.
	 * @param {Matrix} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		const m = this._m.tDot(x).toScaler()
		if (m * y >= 1) return

		const v = x.tDot(this._s).dot(x).toScaler()

		const beta = 1 / (v + this._r)
		const alpha = Math.max(0, 1 - y * m) * beta

		const md = this._s.dot(x)
		md.mult(alpha * y)
		this._m.add(md)
		const sd = this._s.dot(x).dot(x.tDot(this._s))
		sd.mult(beta)
		this._s.sub(sd)
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	/**
	 * Returns predicted datas.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._c)
		const r = x.dot(this._m)
		return r.value.map(v => (v <= 0 ? -1 : 1))
	}
}
