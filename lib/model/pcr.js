import Matrix from '../util/matrix.js'

import { PCA } from './pca.js'

/**
 * Principal component regression
 */
export default class PCR {
	// https://en.wikipedia.org/wiki/Principal_component_regression
	constructor() {
		this._pca = new PCA()
		this._rd = 0
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
		this._pca.fit(x)
		const xh = Matrix.fromArray(this._pca.predict(x, this._rd))
		xh.resize(xh.rows, xh.cols + 1, 1)
		const xtx = xh.tDot(xh)

		this._w = xtx.solve(xh.t).dot(y)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const xh = Matrix.fromArray(this._pca.predict(x, this._rd))
		xh.resize(xh.rows, xh.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
