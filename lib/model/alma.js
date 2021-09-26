import { Matrix } from '../util/math.js'

/**
 * Approximate Large Margin algorithm
 * @see A New Approximate Maximal Margin Classification Algorithm. (2001)
 */
export default class ALMA {
	// https://www.jmlr.org/papers/volume2/gentile01a/gentile01a.pdf
	// A New Approximate Maximal Margin Classification Algorithm. (2001)
	/**
	 * @param {number} p
	 * @param {number} alpha
	 * @param {number} b
	 * @param {number} c
	 */
	constructor(p = 2, alpha = 1, b = 1, c = 1) {
		this._p = p
		this._alpha = alpha
		this._b = b
		this._c = c
		this._w = null
		this._k = 1
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<1 | -1>} train_y
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y

		this._w = Matrix.zeros(this._x.cols, 1)
		this._k = 1
	}

	/**
	 * Update model parameters with one data.
	 * @param {Matrix} x
	 * @param {1 | -1} y
	 */
	update(x, y) {
		const gamma = this._b * Math.sqrt((this._p - 1) / this._k)
		const m = this._w.tDot(x).value[0]
		if (m * y > (1 - this._alpha) * gamma) return

		const eta = this._c / Math.sqrt((this._p - 1) * this._k)
		const dw = x.copyMult(eta * y)
		dw.add(this._w)

		const norm = dw.value.reduce((s, v) => s + v ** this._p, 0) ** (1 / this._p)
		dw.div(Math.max(1, norm))
		this._w = dw
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
	 * @param {Array<Array<number>>} data
	 * @returns {number[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._shift)
		const r = x.dot(this._w)
		return r.value
	}
}
