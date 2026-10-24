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

		const ktk = new Matrix(n, n)
		const dv = [1, -2, 1]
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (Math.abs(i - j) > 2) {
					continue
				}
				let v = 0
				for (let k = Math.max(2, i, j) - 2; k <= Math.min(i, j, n - 3); k++) {
					v += dv[i - k] * dv[j - k]
				}
				ktk.set(i, j, v * this._l + (i === j ? 1 : 0))
			}
		}
		const g = ktk.solve(Matrix.fromArray(data))
		return g.value
	}
}
