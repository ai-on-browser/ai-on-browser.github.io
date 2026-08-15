const lwma = (data, n) => {
	const p = []
	for (let i = 0; i < data.length; i++) {
		const m = Math.max(0, i - n + 1)
		p[i] = 0
		let s = 0
		for (let k = m; k <= i; k++) {
			p[i] += (k - m + 1) * data[k]
			s += k - m + 1
		}
		p[i] /= s
	}
	return p
}

/**
 * Hull moving average
 */
export default class HullMovingAverage {
	// https://alanhull.com/the-hull-moving-average/
	// https://www.oanda.jp/lab-education/technical_analysis/moving_average/hull/#:~:text=%E3%83%8F%E3%83%AB%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87%E7%B7%9A%E3%81%AF,%E3%81%AB%E3%82%88%E3%82%8A%E9%96%8B%E7%99%BA%E3%81%95%E3%82%8C%E3%81%BE%E3%81%97%E3%81%9F%E3%80%82
	// https://qiita.com/siruku6/items/1922b3c802974e356666
	/**
	 * @param {number} n Window size
	 */
	constructor(n) {
		this._n = n
	}

	/**
	 * Returns smoothed values.
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const lwma1 = lwma(data, this._n)
		const lwma2 = lwma(data, Math.floor(this._n / 2))
		const p = []
		for (let i = 0; i < data.length; i++) {
			p[i] = 2 * lwma2[i] - lwma1[i]
		}
		return lwma(p, Math.floor(Math.sqrt(this._n)))
	}
}
