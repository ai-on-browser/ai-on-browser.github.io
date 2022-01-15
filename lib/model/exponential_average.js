/**
 * Exponential moving average
 */
export class ExponentialMovingAverage {
	/**
	 * Returns smoothed values.
	 *
	 * @param {number[]} data
	 * @param {number} k
	 * @returns {number[]}
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
	 * @param {number[]} data
	 * @param {number} k
	 * @returns {number[]}
	 */
	predict(data, k) {
		const p = [data[0]]
		for (let i = 1; i < data.length; i++) {
			p[i] = ((k - 1) * p[i - 1] + data[i]) / k
		}
		return p
	}
}
