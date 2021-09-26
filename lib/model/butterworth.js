import { LowpassFilter } from './lowpass.js'

/**
 * Butterworth filter
 */
export default class ButterworthFilter extends LowpassFilter {
	// https://en.wikipedia.org/wiki/Butterworth_filter
	/**
	 * @param {number} n
	 * @param {number} c
	 */
	constructor(n = 2, c = 0.5) {
		super(c)
		this._n = n
	}

	_cutoff(i, c, xr, xi) {
		const d = Math.sqrt(1 + (i / c) ** (2 * this._n))
		return [xr / d, xi / d]
	}
}
