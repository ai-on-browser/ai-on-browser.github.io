import { LowpassFilter } from './lowpass.js'

/**
 * Chebyshev filter
 */
export default class ChebyshevFilter extends LowpassFilter {
	// https://ja.wikipedia.org/wiki/%E3%83%81%E3%82%A7%E3%83%93%E3%82%B7%E3%82%A7%E3%83%95%E3%83%95%E3%82%A3%E3%83%AB%E3%82%BF
	/**
	 * @param {1 | 2} type
	 * @param {number} ripple
	 * @param {number} n
	 * @param {number} c
	 */
	constructor(type = 1, ripple = 1, n = 2, c = 0.5) {
		super(c)
		this._type = type
		this._n = n
		this._e = ripple
	}

	_chebyshev(n, x) {
		switch (n) {
			case 0:
				return 1
			case 1:
				return x
			case 2:
				return 2 * x ** 2 - 1
			case 3:
				return 4 * x ** 3 - 3 * x
		}
		return 2 * x * this._chebyshev(n - 1, x) - this._chebyshev(n - 2, x)
	}

	_cutoff(i, c, xr, xi) {
		const d =
			this._type === 1
				? Math.sqrt(1 + (this._e * this._chebyshev(this._n, i / c)) ** 2)
				: Math.sqrt(1 + 1 / (this._e * this._chebyshev(this._n, c / i)) ** 2)
		return [xr / d, xi / d]
	}
}
