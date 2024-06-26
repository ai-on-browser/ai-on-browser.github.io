import Matrix from '../util/matrix.js'

/**
 * Kalman filter
 */
export default class KalmanFilter {
	// https://ja.wikipedia.org/wiki/%E3%82%AB%E3%83%AB%E3%83%9E%E3%83%B3%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF%E3%83%BC
	// https://qiita.com/harmegiddo/items/ddd33f40d5e368a210df
	// https://qiita.com/hanon/items/7f03621414c59f06d7ca
	// http://www1.accsnet.ne.jp/~aml00731/kalman.pdf
	constructor() {
		this._d = 10
		this._F = Matrix.eye(this._d, this._d)
		this._Q = Matrix.eye(this._d, this._d)
	}

	/**
	 * Fit and returns smoothed values.
	 * @param {Array<Array<number>>} z Training data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	fit(z) {
		const n = z.length
		const d = z[0].length
		z = Matrix.fromArray(z)
		this._x = [Matrix.randn(this._d, 1)]
		this._P = [this._F.dot(this._F.t)]
		const x_ = []
		const P_ = []

		this._H = Matrix.randn(d, this._d)
		this._H.mult(0.01)
		this._R = z.cov()

		if (d <= this._d) {
			this._x[0] = this._H.solve(z.row(0).t)
		}

		for (let i = 0; i < n; i++) {
			const x = this._F.dot(this._x[i])
			const P = this._F.dot(this._P[i]).dot(this._F.t)
			P.add(this._Q)
			x_.push(x)
			P_.push(P)

			const e = this._H.dot(x)
			e.isub(z.row(i).t)
			const S = this._H.dot(P).dot(this._H.t)
			S.add(this._R)
			const K = P.dot(this._H.tDot(S.inv()))

			this._x.push(Matrix.add(x, K.dot(e)))
			this._P.push(Matrix.sub(Matrix.eye(this._d, this._d), K.dot(this._H)).dot(P))
		}

		let s = this._x[n].copy()

		const f = []
		for (let i = n - 1; i >= 0; i--) {
			const a = this._P[i].dot(this._F.t).dot(P_[i].inv())

			s = Matrix.add(this._x[i], a.dot(Matrix.sub(s, x_[i])))
			f[i] = this._H.dot(s).value
		}
		return f
	}

	/**
	 * Returns predicted future values.
	 * @param {number} k Prediction count
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(k) {
		const pred = []
		let x = this._x[this._x.length - 1]
		let P = this._P[this._P.length - 1]
		for (let i = 0; i < k; i++) {
			x = this._F.dot(x)
			pred.push(this._H.dot(x).value)
			P = this._F.dot(P).dot(this._F.t)
		}
		return pred
	}
}
