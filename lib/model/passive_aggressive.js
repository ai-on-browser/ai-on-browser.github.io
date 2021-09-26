import { Matrix } from '../util/math.js'

/**
 * Passive Aggressive
 */
export default class PA {
	// https://www.slideshare.net/hirsoshnakagawa3/ss-32274089
	/**
	 * @param {0 | 1 | 2} v
	 */
	constructor(v = 0) {
		this._c = 0.1
		this._v = v
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<1 | -1>} train_y
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._m = this._x.mean(0)
		this._x.sub(this._m)
		this._y = train_y

		this._d = this._x.cols
		this._w = Matrix.zeros(this._d, 1)
	}

	/**
	 * Update model parameters with one data.
	 * @param {Matrix} x
	 * @param {1 | -1} y
	 */
	update(x, y) {
		const m = x.dot(this._w).value[0]
		if (y * m >= 1) return
		const l = Math.max(0, 1 - y * m)
		const n = x.norm() ** 2
		let t = 0
		if (this._v === 0) {
			t = l / n
		} else if (this._v === 1) {
			t = Math.min(this._c, l / n)
		} else if (this._v === 2) {
			t = l / (n + 1 / (2 * this._c))
		}
		const xt = x.t
		xt.mult(t * y)
		this._w.add(xt)
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i), this._y[i])
		}
	}

	/**
	 * Returns predicted datas.
	 * @param {Array<Array<number>>} data
	 * @returns {number[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._m)
		const r = x.dot(this._w)
		return r.value
	}
}
