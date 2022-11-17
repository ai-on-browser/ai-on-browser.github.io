/**
 * Returns Davies-Bouldin index.
 *
 * @param {Array<Array<number>>} data Original data
 * @param {*[]} pred Predicted categories
 * @param {number} p P
 * @param {number} q Q
 * @returns {number} Davies-Bouldin index
 */
export function davisBouldinIndex(data, pred, p = 2, q = 1) {
	const n = pred.length
	const dim = data[0].length
	const classes = [...new Set(pred)]
	const nc = classes.length
	const counts = Array(nc).fill(0)

	const centroid = []
	const y = []
	for (let k = 0; k < nc; k++) {
		centroid[k] = Array(dim).fill(0)
		for (let i = 0; i < n; i++) {
			if (pred[i] !== classes[k]) {
				continue
			}
			y[i] = k
			counts[k]++
			for (let d = 0; d < dim; d++) {
				centroid[k][d] += data[i][d]
			}
		}
		centroid[k] = centroid[k].map(v => v / counts[k])
	}

	const s = Array(nc).fill(0)
	for (let i = 0; i < n; i++) {
		const ci = centroid[y[i]]
		const d = data[i].reduce((s, v, d) => s + Math.abs(v - ci[d]) ** p, 0)
		s[y[i]] += d ** (q / p)
	}
	for (let k = 0; k < s.length; k++) {
		s[k] = (s[k] / counts[k]) ** (1 / q)
	}

	const r = Array.from({ length: nc }, () => [])
	let db = 0
	for (let k = 0; k < nc; k++) {
		let max_r = -Infinity
		for (let l = 0; l < k; l++) {
			if (r[k][l] > max_r) {
				max_r = r[k][l]
			}
		}
		for (let l = k + 1; l < nc; l++) {
			const m = centroid[k].reduce((s, v, d) => s + Math.abs(v - centroid[l][d]) ** p, 0)
			r[k][l] = r[l][k] = (s[k] + s[l]) / m ** (1 / p)
			if (r[k][l] > max_r) {
				max_r = r[k][l]
			}
		}
		db += max_r
	}
	return db / nc
}

/**
 * Returns Silhouette coefficient.
 *
 * @param {Array<Array<number>>} data Original data
 * @param {*[]} pred Predicted categories
 * @returns {number[]} Silhouette coefficient
 */
export function silhouetteCoefficient(data, pred) {
	const n = pred.length
	const classes = [...new Set(pred)]
	const dist = (a, b) => Math.sqrt(a.reduce((s, v, d) => s + (v - b[d]) ** 2, 0))

	const d = []
	for (let i = 0; i < n; i++) {
		d[i] = []
		for (let j = 0; j < i; j++) {
			d[i][j] = d[j][i] = dist(data[i], data[j])
		}
	}

	const s = []
	for (let i = 0; i < n; i++) {
		let a = 0
		let c = 0
		for (let j = 0; j < n; j++) {
			if (j === i || pred[j] !== pred[i]) {
				continue
			}
			a += d[i][j]
			c++
		}
		a /= c

		let b = Infinity
		for (let k = 0; k < classes.length; k++) {
			if (pred[i] === classes[k]) {
				continue
			}
			let bk = 0
			let c = 0
			for (let j = 0; j < n; j++) {
				if (pred[j] !== classes[k]) {
					continue
				}
				bk += d[i][j]
				c++
			}
			bk /= c
			if (bk < b) {
				b = bk
			}
		}
		s[i] = (b - a) / Math.max(a, b)
	}
	return s
}

/**
 * Returns Dunn index.
 *
 * @param {Array<Array<number>>} data Original data
 * @param {*[]} pred Predicted categories
 * @param {'max' | 'mean' | 'centroid'} intra_d Intra-cluster distance type
 * @param {'centroid'} inter_d Inter-cluster distance type
 * @returns {number} Dunn index
 */
export function dunnIndex(data, pred, intra_d = 'max', inter_d = 'centroid') {
	const n = pred.length
	const dim = data[0].length
	const classes = [...new Set(pred)]
	const nc = classes.length
	const dist = (a, b) => Math.sqrt(a.reduce((s, v, d) => s + (v - b[d]) ** 2, 0))
	const counts = Array(nc).fill(0)
	const y = []
	for (let i = 0; i < n; i++) {
		const p = classes.indexOf(pred[i])
		y[i] = p
		counts[p]++
	}

	const centroid = []
	if (intra_d === 'centroid' || inter_d === 'centroid') {
		for (let k = 0; k < nc; k++) {
			centroid[k] = Array(dim).fill(0)
			for (let i = 0; i < n; i++) {
				if (pred[i] !== classes[k]) {
					continue
				}
				for (let d = 0; d < dim; d++) {
					centroid[k][d] += data[i][d]
				}
			}
			centroid[k] = centroid[k].map(v => v / counts[k])
		}
	}

	const dk = []
	for (let k = 0; k < nc; k++) {
		if (intra_d === 'max') {
			let max_d = 0
			for (let i = 0; i < n; i++) {
				if (pred[i] !== classes[k]) {
					continue
				}
				for (let j = 0; j < i; j++) {
					if (pred[j] !== classes[k]) {
						continue
					}
					const d = dist(data[i], data[j])
					if (max_d < d) {
						max_d = d
					}
				}
			}
			dk[k] = max_d
		} else if (intra_d === 'mean') {
			let sd = 0
			for (let i = 0; i < n; i++) {
				if (pred[i] !== classes[k]) {
					continue
				}
				for (let j = 0; j < n; j++) {
					if (i === j || pred[j] !== classes[k]) {
						continue
					}
					sd += dist(data[i], data[j])
				}
			}
			dk[k] = (2 * sd) / (counts[k] * (counts[k] - 1))
		} else if (intra_d === 'centroid') {
			let sd = 0
			for (let i = 0; i < n; i++) {
				if (pred[i] !== classes[k]) {
					continue
				}
				sd += dist(data[i], centroid[k])
			}
			dk[k] = sd / counts[k]
		}
	}

	const di = Array.from({ length: nc }, () => [])
	if (inter_d === 'centroid') {
		for (let k = 0; k < nc; k++) {
			for (let l = 0; l < k; l++) {
				di[k][l] = dist(centroid[k], centroid[l])
			}
		}
	}

	const max_dk = Math.max(...dk)
	let min_di = Infinity
	for (let k = 0; k < nc; k++) {
		for (let l = 0; l < k; l++) {
			if (min_di > di[k][l]) {
				min_di = di[k][l]
			}
		}
	}

	return min_di / max_dk
}

/**
 * Returns Purity.
 *
 * @param {*[]} pred Predicted categories
 * @param {*[]} t True categories
 * @returns {number} Purity
 */
export function purity(pred, t) {
	const n = pred.length
	const c = [...new Set(pred)]
	let p = 0
	for (let k = 0; k < c.length; k++) {
		const count = {}
		let max_cnt = 0
		for (let i = 0; i < n; i++) {
			if (pred[i] !== c[k]) {
				continue
			}
			if (!count[t[i]]) {
				count[t[i]] = 0
			}
			count[t[i]]++
			if (max_cnt < count[t[i]]) {
				max_cnt = count[t[i]]
			}
		}
		p += max_cnt
	}
	return p / n
}

/**
 * Returns Rand index.
 *
 * @param {*[]} pred Predicted categories
 * @param {*[]} t True categories
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

/**
 * Returns F-score.
 *
 * @param {*[]} pred Predicted categories
 * @param {*[]} t True categories
 * @param {number} [beta=1] Positive real factor. Recall is considered `beta` times as important as precision.
 * @returns {number} F-score
 */
export function fScore(pred, t, beta = 1) {
	const n = pred.length
	let tp = 0
	let fp = 0
	let fn = 0
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			if (pred[i] === pred[j] && t[i] === t[j]) {
				tp++
			} else if (pred[i] === pred[j] && t[i] !== t[j]) {
				fp++
			} else if (pred[i] !== pred[j] && t[i] === t[j]) {
				fn++
			}
		}
	}
	return ((1 + beta ** 2) * tp) / ((1 + beta ** 2) * tp + beta ** 2 * fn + fp)
}

/**
 * Returns Jaccard index.
 *
 * @param {*[]} pred Predicted categories
 * @param {*[]} t True categories
 * @returns {number} Jaccard index
 */
export function jaccardIndex(pred, t) {
	const n = pred.length
	let tp = 0
	let fp = 0
	let fn = 0
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			if (pred[i] === pred[j] && t[i] === t[j]) {
				tp++
			} else if (pred[i] === pred[j] && t[i] !== t[j]) {
				fp++
			} else if (pred[i] !== pred[j] && t[i] === t[j]) {
				fn++
			}
		}
	}
	return tp / (tp + fp + fn)
}

/**
 * Returns Fowlkes-Mallows index.
 *
 * @param {*[]} pred Predicted categories
 * @param {*[]} t True categories
 * @returns {number} Fowlkes-Mallows index
 */
export function fowlkesMallowsIndex(pred, t) {
	const n = pred.length
	let tp = 0
	let fp = 0
	let fn = 0
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			if (pred[i] === pred[j] && t[i] === t[j]) {
				tp++
			} else if (pred[i] === pred[j] && t[i] !== t[j]) {
				fp++
			} else if (pred[i] !== pred[j] && t[i] === t[j]) {
				fn++
			}
		}
	}
	return tp / Math.sqrt((tp + fp) * (tp + fn))
}
