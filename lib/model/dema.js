const ema = (data, a) => {
	const s = [data[0]]
	for (let i = 1; i < data.length; i++) {
		s[i] = (1 - a) * s[i - 1] + a * data[i]
	}
	return s
}

/**
 * Double exponential moving average
 */
export class DEMA {
	// https://en.wikipedia.org/wiki/Double_exponential_moving_average
	/**
	 * @param {number} k Degree of weighting decrease
	 */
	constructor(k) {
		this._k = k
	}

	/**
	 * Returns smoothed values.
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const a = 2 / (this._k + 1)
		const ema1 = ema(data, a)
		const ema2 = ema(ema1, a)
		const s = []
		for (let i = 0; i < data.length; i++) {
			s[i] = 2 * ema1[i] - ema2[i]
		}
		return s
	}
}
