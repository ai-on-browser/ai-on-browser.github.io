import Matrix from '../util/matrix.js'

/**
 * Elastic net
 */
export default class ElasticNet {
	// see "Regularization and variable selection via the elastic net" H. Zou, T. Hastie. (2005)
	/**
	 * @param {number} [lambda] Regularization strength
	 * @param {number} [alpha] Mixing parameter
	 * @param {'ISTA' | 'CD'} [method] Method name
	 */
	constructor(lambda = 0.1, alpha = 0.5, method = 'CD') {
		this._w = null
		this._method = method
		this._lambda = lambda
		this._alpha = alpha
	}

	_soft_thresholding(x, l) {
		x.map(v => (v < -l ? v + l : v > l ? v - l : 0))
	}

	_calc_b0(x, y) {
		let wei = this._w.copy()
		for (let j = 0; j < wei.cols; j++) {
			wei.set(wei.rows - 1, j, 0)
		}
		let xw = x.dot(wei)
		xw.isub(y)
		let b0 = xw.sum(0)
		b0.div(x.rows)
		this._w.set(this._w.rows - 1, 0, b0)
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		if (!this._w) {
			this._w = Matrix.randn(x.cols, y.cols)
		}

		const l1 = this._lambda * this._alpha
		const l2 = this._lambda * (1 - this._alpha)

		const p = x.cols

		x.concat(Matrix.eye(p, p, Math.sqrt(l2)), 0)
		x.div(Math.sqrt(1 + l2))
		y.concat(Matrix.zeros(p, y.cols), 0)

		this._w.mult(Math.sqrt(1 + l2))
		const lambda = l1 / Math.sqrt(1 + l2)

		if (this._method === 'ISTA') {
			let xx = x.tDot(x)
			xx.map(v => Math.abs(v))
			let mx = Math.max.apply(null, xx.sum(0).value)
			const L = mx / lambda
			let new_w = x.dot(this._w)
			new_w.isub(y)
			new_w = x.t.dot(new_w)
			new_w.div(lambda * L)
			new_w.add(this._w)
			this._soft_thresholding(new_w, 1 / L)

			this._w = new_w
		} else if (this._method === 'CD') {
			for (let i = 0; i < this._w.rows; i++) {
				let xi = x.col(i)
				let wei = this._w.copy()
				for (let j = 0; j < this._w.cols; j++) {
					wei.set(i, j, 0)
				}
				wei = x.dot(wei)
				wei.isub(y)

				let d = xi.tDot(wei)
				this._soft_thresholding(d, lambda)
				d.div(xi.tDot(xi))

				this._w.set(i, 0, d)
			}
		}
		this._w.div(Math.sqrt(1 + l2))
		//this._calc_b0(x, y);
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		return x.dot(this._w).toArray()
	}

	/**
	 * Returns importances of the features.
	 *
	 * @returns {number[]} Importances
	 */
	importance() {
		return this._w.value
	}
}
