import Matrix from '../util/matrix.js'

/**
 * Ridge regressioin
 */
export class Ridge {
	/**
	 * @param {number} [lambda=0.1]
	 */
	constructor(lambda = 0.1) {
		this._w = null
		this._lambda = lambda
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const xtx = x.tDot(x)
		for (let i = 0; i < xtx.rows; i++) {
			xtx.addAt(i, i, this._lambda)
		}

		this._w = xtx.solve(x.t).dot(y)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		return x.dot(this._w).toArray()
	}

	/**
	 * Returns importances of the features.
	 *
	 * @returns {number[]}
	 */
	importance() {
		return this._w.value
	}
}

/**
 * Kernel ridge regression
 */
export class KernelRidge {
	/**
	 * @param {number} [lambda=0.1]
	 * @param {'gaussian'} [kernel=gaussian]
	 */
	constructor(lambda = 0.1, kernel = 'gaussian') {
		this._w = null
		this._x = null
		this._lambda = lambda
		this._kernel = null
		if (kernel === 'gaussian') {
			this._kernel = (x, y, sigma = 1.0) => {
				const s = Matrix.sub(x, y).reduce((acc, v) => acc + v * v, 0)
				return Math.exp(-s / sigma ** 2)
			}
		}
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const K = new Matrix(x.rows, x.rows)
		this._x = []
		for (let i = 0; i < x.rows; i++) {
			this._x.push(x.row(i))
			K.set(i, i, this._kernel(this._x[i], this._x[i]) + this._lambda)
			for (let j = 0; j < i; j++) {
				const v = this._kernel(this._x[i], this._x[j])
				K.set(i, j, v)
				K.set(j, i, v)
			}
		}
		this._w = K.solve(y)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const K = new Matrix(x.rows, this._x.length)
		for (let i = 0; i < x.rows; i++) {
			const xi = x.row(i)
			for (let j = 0; j < this._x.length; j++) {
				const v = this._kernel(xi, this._x[j])
				K.set(i, j, v)
			}
		}
		return K.dot(this._w).toArray()
	}

	/**
	 * Returns importances of the features.
	 *
	 * @returns {number[]}
	 */
	importance() {
		return this._w.value
	}
}
