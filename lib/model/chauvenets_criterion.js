/**
 * Chauvenet's criterion
 */
export default class ChauvenetsCriterion {
	// https://en.wikipedia.org/wiki/Chauvenet%27s_criterion
	/**
	 * @param {number} alpha Significance level
	 */
	constructor(alpha) {
		this._alpha = alpha
	}

	_cdf(z) {
		if (z === Infinity) {
			return 1
		} else if (z === -Infinity) {
			return 0
		}
		const p = 0.3275911
		const a1 = 0.254829592
		const a2 = -0.284496736
		const a3 = 1.421413741
		const a4 = -1.453152027
		const a5 = 1.061405429

		const sign = z < 0 ? -1 : 1
		const x = Math.abs(z) / Math.sqrt(2)
		const t = 1 / (1 + p * x)
		const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
		return 0.5 * (1 + sign * erf)
	}

	_ppf(x) {
		if (x >= 1) return Infinity
		if (x === 0.5) return 0
		if (x < 0.5) return -this._ppf(1 - x)
		let min = 0,
			max = null
		let v = 1
		const e = 1.0e-8
		let maxCount = 1.0e4
		while (maxCount-- > 0) {
			const t = this._cdf(v)
			if (Math.abs(t - x) < e) return v
			if (x < t) {
				max = v
				v = (v + min) / 2
			} else {
				min = v
				v = max === null ? v * 2 : (v + max) / 2
			}
		}
		throw 'loop converged'
	}

	/**
	 * Returns a list of the data predicted as outliers or not.
	 * @param {number[]} data Training data
	 * @returns {boolean[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const p = 1 / (4 * n)
		const dmax = Math.abs(this._ppf(p))

		let m = 0
		let m2 = 0
		for (let i = 0; i < n; i++) {
			m += data[i]
			m2 += data[i] ** 2
		}
		m /= n
		const s = Math.sqrt(m2 / n - m ** 2)

		return data.map(v => Math.abs(v - m) / s >= dmax)
	}
}
