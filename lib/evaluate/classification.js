/**
 * Returns accuracy.
 *
 * @param {*[]} pred Predicted classes
 * @param {*[]} t True classes
 * @returns {number} Accuracy
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
