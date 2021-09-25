import { HoltWinters } from './holt_winters.js'

/**
 * Returns exponential moving average results.
 * @function
 * @param {Array<Array<number>>} data
 * @param {number} k
 * @returns {Array<Array<number>>}
 */
export const exponentialMovingAverage = (data, k) => {
	const hw = new HoltWinters(2 / (k + 1))
	return hw.fit(data)
}

/**
 * Returns modified moving average results.
 * @function
 * @param {Array<Array<number>>} data
 * @param {number} k
 * @returns {Array<Array<number>>}
 */
export const modifiedMovingAverage = (data, k) => {
	const p = [data[0]]
	for (let i = 1; i < data.length; i++) {
		p.push(p[i - 1].map((v, j) => ((k - 1) * v + data[i][j]) / k))
	}
	return p
}
