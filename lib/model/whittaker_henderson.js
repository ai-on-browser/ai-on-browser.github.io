import Matrix from '../util/matrix.js'

/**
 * Whittaker-Henderson smoothing
 */
export default class WhittakerHendersonSmoothing {
	// https://en.wikipedia.org/wiki/Whittaker%E2%80%93Henderson_smoothing
	/**
	 * @param {number} l Sensitivity of the trend
	 * @param {number} p Order
	 */
	constructor(l, p = 3) {
		this._l = l
		this._p = p
	}

	/**
	 * Returns smoothed values.
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const n = data.length

		const ktk = new Matrix(n, n)
		const dv = [-1, 1]
		for (let k = 1; k < this._p; k++) {
			dv.push(1)
			for (let i = k; i > 0; i--) {
				dv[i] = dv[i - 1] - dv[i]
			}
			dv[0] = -dv[0]
		}
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (Math.abs(i - j) > this._p) {
					continue
				}
				let v = 0
				for (let k = Math.max(this._p, i, j) - this._p; k <= Math.min(i, j, n - this._p - 1); k++) {
					v += dv[i - k] * dv[j - k]
				}
				ktk.set(i, j, v * this._l + (i === j ? 1 : 0))
			}
		}

		const g = ktk.solve(Matrix.fromArray(data))
		return g.value
	}
}
