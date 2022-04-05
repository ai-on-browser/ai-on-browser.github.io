/**
 * Returns Rand index.
 *
 * @param {number[]} pred Predicted categories
 * @param {number[]} t True categories
 * @returns {number} Rank index
 */
export function randIndex(pred, t) {
	const n = pred.length
	let r = 0
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			if (pred[i] === pred[j] && t[i] === t[j]) {
				r++
			} else if (pred[i] !== pred[j] && t[i] !== t[j]) {
				r++
			}
		}
	}
	return r / ((n * (n - 1)) / 2)
}
