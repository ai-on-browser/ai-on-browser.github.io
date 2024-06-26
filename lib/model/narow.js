import Matrix from '../util/matrix.js'

/**
 * Narrow Adaptive Regularization Of Weights
 */
export default class NAROW {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.231.1691&rep=rep1&type=pdf
	// New Adaptive Algorithms for Online Classification.
	// https://olpy.readthedocs.io/en/latest/_modules/olpy/classifiers/narow.html#NAROW
	// https://github.com/LIBOL/LIBOL/blob/master/algorithms/NAROW.m
	/**
	 * @param {number} [b] Tuning parameter
	 */
	constructor(b = 1) {
		this._w = null
		this._s = null
		this._b = b
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
		this._w = Matrix.zeros(this._d, 1)
		this._s = Matrix.eye(this._d, this._d)
	}

	/**
	 * Update model parameters with one data.
	 * @param {Matrix} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		const m = this._w.tDot(x).toScaler()
		if (m * y >= 1) return

		const v = x.tDot(this._s).dot(x).toScaler()

		const r = v > 1 / this._b ? v / (this._b * v - 1) : -Infinity
		const beta = 1 / (v + r)
		const alpha = Math.max(0, 1 - y * m) * beta
		const s = this._s.dot(x)

		this._w.add(Matrix.mult(s, alpha * y))
		const sd = s.dot(s.t)
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
		const r = x.dot(this._w)
		return r.value.map(v => (v <= 0 ? -1 : 1))
	}
}
