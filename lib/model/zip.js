/**
 * Zero-inflated poisson
 */
export default class ZeroInflatedPoisson {
	// https://towardsdatascience.com/an-illustrated-guide-to-the-zero-inflated-poisson-model-b22833343057
	// https://en.wikipedia.org/wiki/Zero-inflated_model
	// https://qiita.com/nozma/items/52211b1bacaa8a898164
	// http://web.uvic.ca/~dgiles/downloads/count/zip.pdf
	// https://ncss-wpengine.netdna-ssl.com/wp-content/themes/ncss/pdf/Procedures/NCSS/Zero-Inflated_Poisson_Regression.pdf
	/**
	 * @param {'moments' | 'maximum_likelihood'} [method] Method name
	 */
	constructor(method = 'maximum_likelihood') {
		this._method = method
	}

	/**
	 * Fit model.
	 * @param {number[]} x Training data
	 */
	fit(x) {
		if (this._method === 'moments') {
			this._mo(x)
		} else {
			this._ml(x)
		}
	}

	_mo(x) {
		const m = x.reduce((s, v) => s + v, 0) / x.length
		const s2 = x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length

		this._l = (s2 + m ** 2) / m - 1
		this._pi = (s2 - m) / (s2 + m ** 2 - m)
	}

	_lambert_w(z) {
		// https://ja.wikipedia.org/wiki/%E3%83%A9%E3%83%B3%E3%83%99%E3%83%AB%E3%83%88%E3%81%AEW%E9%96%A2%E6%95%B0
		if (z === 0) {
			return 0
		}
		let w = 0
		for (let i = 0; i < 20; i++) {
			w = w - (w * Math.exp(w) - z) / (Math.exp(w) * (w + 1) - ((w + 2) * (w * Math.exp(w) - z)) / (2 * w + 2))
		}
		return w
	}

	_ml(x) {
		const n = x.length
		const n0 = x.reduce((s, v) => s + (v === 0 ? 1 : 0), 0)
		const m = x.reduce((s, v) => s + v, 0) / n
		const s = m / (1 - n0 / n)

		this._l = this._lambert_w(-s * Math.exp(-s)) + s
		this._pi = 1 - m / this._l
	}

	/**
	 * Returns predicted probabilities.
	 * @param {number[]} x Sample data
	 * @returns {number[]} Predicted values
	 */
	probability(x) {
		return x.map(v => {
			if (v === 0) {
				return this._pi + (1 - this._pi) * Math.exp(-this._l)
			} else {
				let f = 1
				for (let i = 2; i <= v; i++) {
					f *= i
				}
				return ((1 - this._pi) * this._l ** v * Math.exp(-this._l)) / f
			}
		})
	}
}
