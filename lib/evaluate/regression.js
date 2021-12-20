/**
 * Returns RMSE.
 * @function
 * @param {number[] | Array<Array<number>>} pred
 * @param {number[] | Array<Array<number>>} t
 * @returns {number | number[]}
 */
export const rmse = (pred, t) => {
	const n = pred.length
	if (!Array.isArray(pred[0])) {
		let e = 0
		for (let i = 0; i < n; i++) {
			e += (pred[i] - t[i]) ** 2
		}
		return Math.sqrt(e / n)
	}
	const d = pred[0].length
	const e = Array(d).fill(0)
	for (let i = 0; i < n; i++) {
		for (let d = 0; d < pred[i].length; d++) {
			e[d] += (pred[i][d] - t[i][d]) ** 2
		}
	}
	return e.map(v => Math.sqrt(v / n))
}
