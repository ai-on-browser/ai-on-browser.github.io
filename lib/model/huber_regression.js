import Matrix from '../util/matrix.js'

/**
 * Huber regression
 */
export default class HuberRegression {
	// https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.HuberRegressor.html
	// https://www.smartbowwow.com/2019/05/blog-post.html
	/**
	 * @param {number} [e] Threshold of outliers
	 * @param {'rls' | 'gd'} [method] Method name
	 * @param {number} [lr] Learning rate
	 */
	constructor(e = 1.35, method = 'rls', lr = 1) {
		this._e = e
		this._s = 1
		this._lr = lr
		this._w = null
		this._method = method
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		const xh = Matrix.resize(x, x.rows, x.cols + 1, 1)
		y = Matrix.fromArray(y)
		if (!this._w) {
			this._w = xh.tDot(xh).solve(xh.tDot(y))
		}

		if (this._method === 'rls') {
			this._rls(xh, y)
		} else if (this._method === 'gd') {
			this._gd(xh, y)
		}
	}

	_gd(x, y) {
		const r = x.dot(this._w)
		r.sub(y)
		const dr = Matrix.map(r, v => {
			if (Math.abs(v / this._s) <= this._e) {
				return v / this._s
			} else if (v / this._s > this._e) {
				return this._e
			} else {
				return -this._e
			}
		})
		const dw = x.tDot(dr)
		dw.mult(this._lr / x.rows)
		this._w.sub(dw)

		const rds = Matrix.map(dr, (v, i) => v * (-r.at(i) / this._s ** 2))
		this._s -= (rds.sum() * this._lr) / x.rows
	}

	_rls(x, y) {
		const r = x.dot(this._w)
		r.sub(y)
		const w = Matrix.map(r, v => {
			if (Math.abs(v / this._s) <= this._e) {
				return 1
			}
			return this._e / Math.abs(v / this._s)
		})

		for (let i = 0; i < this._w.cols; i++) {
			const xhw = Matrix.mult(x, w.col(i))
			const wi = xhw.tDot(x).solve(xhw.tDot(y.col(i)))
			this._w.set(0, i, wi)
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const xh = Matrix.resize(x, x.rows, x.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
