/**
 * Returns cumulative moving average results.
 * @function
 * @param {Array<Array<number>>} data
 * @returns {Array<Array<number>>}
 */
const cumulativeMovingAverage = data => {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	const p = []
	const d = data[0].length
	const s = Array(d).fill(0)
	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < d; j++) {
			s[j] += data[i][j]
		}
		p.push(s.map(v => v / (i + 1)))
	}
	return p
}

export default cumulativeMovingAverage
