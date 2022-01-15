import { Matrix } from '../util/math.js'

/**
 * Online gradient descent
 */
export default class OnlineGradientDescent {
	// https://olpy.readthedocs.io/en/latest/modules/olpy.classifiers.OGD.html#olpy.classifiers.OGD
	/**
	 * @param {number} c
	 * @param {string} loss
	 */
	constructor(c = 1, loss = 'zero_one') {
		this._c = c
		this._w = null

		this._loss = (t, y) => {
			return t === y ? 0 : 1
		}
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<1 | -1>} train_y
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y

		this._w = Matrix.zeros(this._x.cols, 1)
		this._t = 1
	}

	/**
	 * Update model parameters with one data.
	 *
	 * @param {Matrix} x
	 * @param {1 | -1} y
	 */
	update(x, y) {
		const m = Math.sign(this._w.tDot(x).toScaler())
		const loss = this._loss(y, m)
		if (loss === 0) return
		const c = this._c / Math.sqrt(this._t)

		this._w.add(x.copyMult(c * y))
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
	 * @param {Array<Array<number>>} data
	 * @returns {(1 | -1)[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._shift)
		const r = x.dot(this._w)
		return r.value.map(v => (v <= 0 ? -1 : 1))
	}
}
