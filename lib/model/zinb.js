const logGamma = z => {
	// https://en.wikipedia.org/wiki/Lanczos_approximation
	// https://slpr.sakura.ne.jp/qp/gamma-function/
	let x = 0
	if (Number.isInteger(z)) {
		for (let i = 2; i < z; i++) {
			x += Math.log(i)
		}
	} else if (Number.isInteger(z - 0.5)) {
		const n = z - 0.5
		x = Math.log(Math.sqrt(Math.PI)) - Math.log(2) * n
		for (let i = 2 * n - 1; i > 0; i -= 2) {
			x += Math.log(i)
		}
	} else if (z < 0.5) {
		x = Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z)
	} else {
		const p = [
			676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,
			-0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
		]
		z -= 1
		x = 0.99999999999980993
		for (let i = 0; i < p.length; i++) {
			x += p[i] / (z + i + 1)
		}
		const t = z + p.length - 0.5
		x = Math.log(Math.sqrt(2 * Math.PI)) + Math.log(t) * (z + 0.5) - t + Math.log(x)
	}
	return x
}

/**
 * Zero-inflated negative binomial
 */
export default class ZeroInflatedNegativeBinomial {
	// https://stats.oarc.ucla.edu/r/dae/zinb/
	// https://juniperpublishers.com/bboaj/pdf/BBOAJ.MS.ID.555566.pdf
	// https://trialsjournal.biomedcentral.com/articles/10.1186/s13063-023-07648-8
	/**
	 * Fit model.
	 *
	 * @param {number[]} x Training data
	 */
	fit(x) {
		const m = x.reduce((s, v) => s + v, 0) / x.length
		const s2 = x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length

		const counts = []
		for (let i = 0; i < x.length; i++) {
			counts[x[i]] = (counts[x[i]] ?? 0) + 1
		}

		const calc_llh = pi => {
			const l = m / (1 - pi)
			const k = (s2 / m - 1) / l - pi
			if (k <= 1.0e-5) {
				return -Infinity
			}
			let llh = 0
			for (let i = 0; i < counts.length; i++) {
				if (counts[i]) {
					llh += counts[i] * Math.log(this._probability(i, pi, k, l))
				}
			}
			return llh
		}

		const maxpi = (s2 / m - 1) / (m + s2 / m - 1)
		const values = [0, maxpi / 2, maxpi].map(p => [p, calc_llh(p)])
		while (values[2][0] - values[0][0] > 1.0e-8) {
			const llh_l = calc_llh((values[0][0] + values[1][0]) / 2)
			const llh_h = calc_llh((values[1][0] + values[2][0]) / 2)
			if (values[1][1] < llh_l) {
				values[2] = values[1]
				values[1] = [(values[0][0] + values[1][0]) / 2, llh_l]
			} else if (values[1][1] < llh_h) {
				values[0] = values[1]
				values[1] = [(values[1][0] + values[2][0]) / 2, llh_h]
			} else {
				values[0] = [(values[0][0] + values[1][0]) / 2, llh_l]
				values[2] = [(values[1][0] + values[2][0]) / 2, llh_h]
			}
		}
		this._pi = values[1][0]
		this._l = m / (1 - this._pi)
		this._k = (s2 / m - 1) / this._l - this._pi
	}

	_probability(z, p, k, l) {
		if (z === 0) {
			return p + (1 - p) / (1 + k * l) ** (1 / k)
		}
		return (
			(1 - p) *
			Math.exp(
				logGamma(z + 1 / k) +
					z * Math.log(k * l) -
					logGamma(z + 1) -
					logGamma(1 / k) -
					(z + 1 / k) * Math.log(1 + k * l)
			)
		)
	}

	/**
	 * Returns predicted probabilities.
	 *
	 * @param {number[]} x Sample data
	 * @returns {number[]} Predicted values
	 */
	probability(x) {
		return x.map(v => {
			return this._probability(v, this._pi, this._k, this._l)
		})
	}
}
