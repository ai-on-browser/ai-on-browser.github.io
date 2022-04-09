/**
 * Cumulative moving average
 */
export default class CumulativeMovingAverage {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	/**
	 * Returns smoothed values.
	 *
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const p = []
		let s = 0
		for (let i = 0; i < data.length; i++) {
			s += data[i]
			p.push(s / (i + 1))
		}
		return p
	}
}
