import Matrix from '../util/matrix.js'

/**
 * Hodrick-Prescott filter
 */
export default class HodrickPrescottFilter {
	// https://en.wikipedia.org/wiki/Hodrick%E2%80%93Prescott_filter
	/**
	 * @param {number} l Sensitivity of the trend
	 */
	constructor(l) {
		this._l = l
	}

	/**
	 * Returns smoothed values.
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const K = new Matrix(n - 2, n)
		for (let i = 0; i < n - 2; i++) {
			K.set(i, i, 1)
			K.set(i, i + 1, -2)
			K.set(i, i + 2, 1)
		}
		const ktk = K.tDot(K)
		ktk.mult(this._l)
		for (let i = 0; i < n; i++) {
			ktk.addAt(i, i, 1)
		}
		const g = ktk.solve(Matrix.fromArray(data))
		return g.value
	}
}
