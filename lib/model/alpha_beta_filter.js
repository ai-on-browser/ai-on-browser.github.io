/**
 * Alpha-Beta filter
 */
export default class AlphaBetaFilter {
	// https://en.wikipedia.org/wiki/Alpha_beta_filter
	/**
	 * @param {number} alpha Value to correct the position estimate
	 * @param {number} beta Value to correct the velocity estimate
	 */
	constructor(alpha, beta) {
		this._a = alpha
		this._b = beta
	}

	/**
	 * Returns smoothed values.
	 * @param {number[]} x Training data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		const n = x.length

		let xk = 0
		let vk = 0
		const dt = 1

		const p = []
		for (let i = 0; i < n; i++) {
			xk += vk * dt
			const rk = x[i] - xk
			xk += this._a * rk
			vk += (this._b * rk) / dt
			p.push(xk)
		}
		return p
	}
}
