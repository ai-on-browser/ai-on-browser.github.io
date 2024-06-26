import Matrix from '../util/matrix.js'

/**
 * Normal Herd
 */
export default class NormalHERD {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.1059.5999&rep=rep1&type=pdf
	// Learning via Gaussian Herding. (2010)
	/**
	 * @param {'full' | 'exact' | 'project' | 'drop'} [type] Method name
	 * @param {number} [c] Tradeoff value between passiveness and aggressiveness
	 */
	constructor(type = 'exact', c = 0.1) {
		this._m = null
		this._s = null
		this._c = c
		this._method = type
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<1 | -1>} train_y Target values
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
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
		if (m * y > 1) return

		const v = x.tDot(this._s).dot(x).toScaler()
		const alpha = Math.max(0, 1 - m * y) / (v + 1 / this._c)
		const dm = this._s.dot(x)
		dm.mult(y * alpha)
		this._m.add(dm)

		if (this._method === 'full') {
			const ds = this._s.dot(x).dot(x.tDot(this._s))
			ds.mult((this._c ** 2 * v + 2 * this._c) / (1 + this._c * v) ** 2)
			this._s.sub(ds)
		} else if (this._method === 'exact') {
			for (let r = 0; r < this._s.rows; r++) {
				const sr = this._s.at(r, r)
				const xr = x.at(r, 0)
				this._s.set(r, r, sr / (1 + this._c * xr ** 2 * sr) ** 2)
			}
		} else if (this._method === 'project') {
			const xsx = 2 * this._c + this._c ** 2 * v
			for (let r = 0; r < this._s.rows; r++) {
				const sr = this._s.at(r, r)
				const xr = x.at(r, 0)
				this._s.set(r, r, 1 / (1 / sr + xsx * xr ** 2))
			}
		} else if (this._method === 'drop') {
			const xsx = 2 * this._c + this._c ** 2 * v
			for (let r = 0; r < this._s.rows; r++) {
				const sr = this._s.at(r, r)
				const xr = x.at(r, 0)
				this._s.set(r, r, sr - ((sr * xr) ** 2 * xsx) / (1 + this._c * v) ** 2)
			}
		}
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
		x.sub(this._shift)
		const r = x.dot(this._m)
		return r.value.map(v => (v <= 0 ? -1 : 1))
	}
}
