/**
 * Exponential moving average
 */
export class ExponentialMovingAverage {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87#%E6%8C%87%E6%95%B0%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	/**
	 * Returns smoothed values.
	 *
	 * @param {number[]} data Training data
	 * @param {number} k Degree of weighting decrease
	 * @returns {number[]} Predicted values
	 */
	predict(data, k) {
		const a = 2 / (k + 1)
		const s = [data[0]]
		for (let i = 1; i < data.length; i++) {
			s[i] = (1 - a) * s[i - 1] + a * data[i]
		}
		return s
	}
}

/**
 * Modified moving average
 */
export class ModifiedMovingAverage {
	/**
	 * Returns smoothed values.
	 *
	 * @param {number[]} data Training data
	 * @param {number} k Degree of weighting decrease
	 * @returns {number[]} Predicted values
	 */
	predict(data, k) {
		const p = [data[0]]
		for (let i = 1; i < data.length; i++) {
			p[i] = ((k - 1) * p[i - 1] + data[i]) / k
		}
		return p
	}
}
