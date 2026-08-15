const ema = (data, a) => {
	const s = [data[0]]
	for (let i = 1; i < data.length; i++) {
		s[i] = (1 - a) * s[i - 1] + a * data[i]
	}
	return s
}

/**
 * T3 moving average
 */
export default class T3MovingAverage {
	// Smoothing Techniques For More Accurate Signals
	// https://www.tradingpedia.com/forex-trading-indicators/t3-moving-average-indicator/
	/**
	 * @param {number} k Degree of weighting decrease
	 * @param {number} [a] Volume factor
	 */
	constructor(k, a = 0.7) {
		this._k = k
		this._a = a
	}

	/**
	 * Returns smoothed values.
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const a = 2 / (this._k + 1)
		const e = [data]
		for (let i = 0; i < 6; i++) {
			e[i + 1] = ema(e[i], a)
		}
		const c1 = -(this._a ** 3)
		const c2 = 3 * this._a ** 2 + 3 * this._a ** 3
		const c3 = -6 * this._a ** 2 - 3 * this._a - 3 * this._a ** 3
		const c4 = 1 + 3 * this._a + this._a ** 3 + 3 * this._a ** 2

		const s = []
		for (let i = 0; i < data.length; i++) {
			s[i] = c1 * e[6][i] + c2 * e[5][i] + c3 * e[4][i] + c4 * e[3][i]
		}
		return s
	}
}
