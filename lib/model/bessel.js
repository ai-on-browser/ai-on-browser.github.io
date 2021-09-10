import { LowpassFilter } from './lowpass.js'

export default class BesselFilter extends LowpassFilter {
	// https://ja.wikipedia.org/wiki/%E3%83%99%E3%83%83%E3%82%BB%E3%83%AB%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF
	// http://okawa-denshi.jp/blog/?th=2009012600
	constructor(n = 2, c = 0.5) {
		super(c)
		this._n = n

		this._coef = []
		for (let k = 0; k <= this._n; k++) {
			let c = 1
			for (let i = 0; i < this._n; i++) {
				c *= 2 * this._n - k - i
				if (i < k) {
					c /= i + 1
				} else {
					c /= 2
				}
			}
			this._coef[k] = c
		}
	}

	_reverse_bessel_polynomial(x) {
		let v = 0
		for (let k = 0; k <= this._n; k++) {
			v += this._coef[k] * x ** k
		}
		return v
	}

	_cutoff(i, c, xr, xi) {
		const d = this._reverse_bessel_polynomial(0) / this._reverse_bessel_polynomial(i / c)
		return [xr * d, xi * d]
	}
}
