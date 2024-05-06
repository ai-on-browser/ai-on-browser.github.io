/**
 * Zero-truncated poisson
 */
export default class ZeroTruncatedPoisson {
	// https://en.wikipedia.org/wiki/Zero-truncated_Poisson_distribution
	// https://www.stat.umn.edu/geyer/3701/notes/zero.html
	constructor() {
		this._lr = 0.1
	}

	/**
	 * Fit model.
	 * @param {number[]} x Training data
	 */
	fit(x) {
		const mean = x.reduce((s, v) => s + v, 0) / x.length

		let th = 0
		while (true) {
			const m = Math.exp(th)
			const myu = m / (1 - Math.exp(-m))
			th += this._lr * (mean - myu)
			if (Math.abs(mean - myu) < 1.0e-8) {
				break
			}
		}
		this._lambda = Math.exp(th)
	}

	/**
	 * Returns predicted probabilities.
	 * @param {number[]} x Sample data
	 * @returns {number[]} Predicted values
	 */
	probability(x) {
		return x.map(v => {
			let f = 1
			for (let i = 2; i <= v; i++) {
				f *= i
			}
			return this._lambda ** v / ((Math.exp(this._lambda) - 1) * f)
		})
	}
}
