/**
 * Returns exponential moving average results.
 * @function
 * @param {Array<Array<number>>} data
 * @param {number} k
 * @returns {Array<Array<number>>}
 */
export const exponentialMovingAverage = (data, k) => {
	const a = 2 / (k + 1)
	const s = [data[0].concat()]
	for (let i = 1; i < data.length; i++) {
		s[i] = []
		for (let k = 0; k < data[i].length; k++) {
			s[i][k] = (1 - a) * s[i - 1][k] + a * data[i][k]
		}
	}
	return s
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
