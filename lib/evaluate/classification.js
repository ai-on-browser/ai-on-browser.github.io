/**
 * Returns accuracy.
 *
 * @function
 * @param {*[]} pred
 * @param {*[]} t
 * @returns {number}
 */
export const accuracy = (pred, t) => {
	const n = pred.length
	let c = 0
	for (let i = 0; i < n; i++) {
		if (pred[i] === t[i]) {
			c++
		}
	}
	return c / n
}
