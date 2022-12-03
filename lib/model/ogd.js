import Matrix from '../util/matrix.js'

/**
 * Online gradient descent
 */
export default class OnlineGradientDescent {
	// https://olpy.readthedocs.io/en/latest/modules/olpy.classifiers.OGD.html#olpy.classifiers.OGD
	/**
	 * @param {number} [c=1] Tuning parameter
	 * @param {'zero_one'} [loss=zero_one] Loss type name
	 */
	constructor(c = 1, loss = 'zero_one') {
		this._c = c
		this._w = null

		if (loss === 'zero_one') {
			this._loss = (t, y) => {
				return t === y ? 0 : 1
			}
		}
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._y = train_y

		this._w = Matrix.zeros(this._x.cols, 1)
		this._w0 = 0
		this._t = 1
	}

	/**
	 * Update model parameters with one data.
	 *
	 * @param {Matrix} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		const m = Math.sign(this._w.tDot(x).toScaler() + this._w0)
		const loss = this._loss(y, m)
		if (loss === 0) return
		const c = this._c / Math.sqrt(this._t)

		this._w.add(Matrix.mult(x, c * y))
		this._w0 += c * y
		this._t++
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
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const r = x.dot(this._w)
		return r.value.map(v => (v + this._w0 <= 0 ? -1 : 1))
	}
}
