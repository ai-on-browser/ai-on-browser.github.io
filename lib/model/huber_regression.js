import { Matrix } from '../util/math.js'

/**
 * Huber regression
 */
export default class HuberRegression {
	// https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.HuberRegressor.html
	// https://www.smartbowwow.com/2019/05/blog-post.html
	/**
	 * @param {number} [e=1.35]
	 */
	constructor(e = 1.35) {
		this._e = e
		this._s = 1
		this._w = null
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		const xh = x.resize(x.rows, x.cols + 1, 1)
		y = Matrix.fromArray(y)
		if (!this._w) {
			this._w = Matrix.randn(xh.cols, y.cols)
		}

		this._ls(xh, y)
	}

	_ls(x, y) {
		const r = x.dot(this._w)
		r.sub(y)
		r.map(v => {
			if (Math.abs(v / this._s) <= this._e) {
				return 1
			}
			return this._e / Math.abs(v / this._s)
		})

		for (let i = 0; i < this._w.cols; i++) {
			const xhw = x.copyMult(r.col(i))
			const w = xhw.tDot(x).solve(xhw.tDot(y.col(i)))
			this._w.set(0, i, w)
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const xh = x.resize(x.rows, x.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
