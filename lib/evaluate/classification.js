/**
 * Returns accuracy.
 *
 * @param {*[]} pred
 * @param {*[]} t
 * @returns {number}
 */
export function accuracy(pred, t) {
	const n = pred.length
	let c = 0
	for (let i = 0; i < n; i++) {
		if (pred[i] === t[i]) {
			c++
		}
	}
	return c / n
}
