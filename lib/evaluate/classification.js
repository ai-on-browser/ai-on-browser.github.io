/**
 * Returns accuracy.
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

/**
 * Returns precision with macro average.
 * @param {*[]} pred Predicted classes
 * @param {*[]} t True classes
 * @returns {number} Precision
 */
export function precision(pred, t) {
	const n = pred.length
	const classes = [...new Set(t)]
	let c = 0
	for (let k = 0; k < classes.length; k++) {
		let tp = 0
		let fp = 0
		for (let i = 0; i < n; i++) {
			if (t[i] === classes[k] && pred[i] === classes[k]) {
				tp++
			} else if (t[i] !== classes[k] && pred[i] === classes[k]) {
				fp++
			}
		}
		c += tp / (tp + fp)
	}
	return c / classes.length
}

/**
 * Returns recall with macro average.
 * @param {*[]} pred Predicted classes
 * @param {*[]} t True classes
 * @returns {number} Recall
 */
export function recall(pred, t) {
	const n = pred.length
	const classes = [...new Set(t)]
	let c = 0
	for (let k = 0; k < classes.length; k++) {
		let tp = 0
		let fn = 0
		for (let i = 0; i < n; i++) {
			if (t[i] === classes[k] && pred[i] === classes[k]) {
				tp++
			} else if (t[i] === classes[k] && pred[i] !== classes[k]) {
				fn++
			}
		}
		c += tp / (tp + fn)
	}
	return c / classes.length
}

/**
 * Returns F-score with macro average.
 * @param {*[]} pred Predicted classes
 * @param {*[]} t True classes
 * @param {number} [beta] Positive real factor. Recall is considered `beta` times as important as precision.
 * @returns {number} F-score
 */
export function fScore(pred, t, beta = 1) {
	const n = pred.length
	const classes = [...new Set(t)]
	let c = 0
	for (let k = 0; k < classes.length; k++) {
		let tp = 0
		let fp = 0
		let fn = 0
		for (let i = 0; i < n; i++) {
			if (t[i] === classes[k] && pred[i] === classes[k]) {
				tp++
			} else if (t[i] !== classes[k] && pred[i] === classes[k]) {
				fp++
			} else if (t[i] === classes[k] && pred[i] !== classes[k]) {
				fn++
			}
		}
		c += ((1 + beta ** 2) * tp) / ((1 + beta ** 2) * tp + fp + beta ** 2 * fn)
	}
	return c / classes.length
}

/**
 * Returns Cohen's kappa coefficient.
 * @param {*[]} pred Predicted classes
 * @param {*[]} t True classes
 * @returns {number} Cohen's kappa coefficient
 */
export function cohensKappa(pred, t) {
	const n = pred.length
	const classes = [...new Set(t)]
	const cp = Array(classes.length).fill(0)
	const ct = Array(classes.length).fill(0)
	let p0 = 0
	for (let i = 0; i < n; i++) {
		cp[classes.indexOf(pred[i])]++
		ct[classes.indexOf(t[i])]++
		if (pred[i] === t[i]) {
			p0++
		}
	}
	p0 /= n
	const pe = cp.reduce((s, v, k) => s + v * ct[k], 0) / n ** 2
	return (p0 - pe) / (1 - pe)
}
