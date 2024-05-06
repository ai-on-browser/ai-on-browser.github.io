/**
 * Returns MSE (Mean Squared Error).
 * @param {number[] | Array<Array<number>>} pred Predicted values
 * @param {number[] | Array<Array<number>>} t True values
 * @returns {number | number[]} Mean Squared Error
 */
export function mse(pred, t) {
	const n = pred.length
	if (!Array.isArray(pred[0])) {
		let e = 0
		for (let i = 0; i < n; i++) {
			e += (pred[i] - t[i]) ** 2
		}
		return e / n
	}
	const dim = pred[0].length
	const e = Array(dim).fill(0)
	for (let i = 0; i < n; i++) {
		for (let d = 0; d < dim; d++) {
			e[d] += (pred[i][d] - t[i][d]) ** 2
		}
	}
	return e.map(v => v / n)
}

/**
 * Returns RMSE (Root Mean Squared Error).
 * @param {number[] | Array<Array<number>>} pred Predicted values
 * @param {number[] | Array<Array<number>>} t True values
 * @returns {number | number[]} Root Mean Squared Error
 */
export function rmse(pred, t) {
	const e = mse(pred, t)
	if (!Array.isArray(e)) {
		return Math.sqrt(e)
	}
	return e.map(Math.sqrt)
}

/**
 * Returns MAE (Mean Absolute Error).
 * @param {number[] | Array<Array<number>>} pred Predicted values
 * @param {number[] | Array<Array<number>>} t True values
 * @returns {number | number[]} Mean Absolute Error
 */
export function mae(pred, t) {
	const n = pred.length
	if (!Array.isArray(pred[0])) {
		let e = 0
		for (let i = 0; i < n; i++) {
			e += Math.abs(pred[i] - t[i])
		}
		return e / n
	}
	const dim = pred[0].length
	const e = Array(dim).fill(0)
	for (let i = 0; i < n; i++) {
		for (let d = 0; d < dim; d++) {
			e[d] += Math.abs(pred[i][d] - t[i][d])
		}
	}
	return e.map(v => v / n)
}

/**
 * Returns MAD (Median Absolute Deviation).
 * @param {number[] | Array<Array<number>>} pred Predicted values
 * @param {number[] | Array<Array<number>>} t True values
 * @returns {number | number[]} Median Absolute Deviation
 */
export function mad(pred, t) {
	const n = pred.length
	if (!Array.isArray(pred[0])) {
		const e = []
		for (let i = 0; i < n; i++) {
			e[i] = Math.abs(pred[i] - t[i])
		}
		e.sort((a, b) => a - b)
		return e.length % 2 === 1 ? e[(e.length - 1) / 2] : (e[e.length / 2] + e[e.length / 2 - 1]) / 2
	}
	const dim = pred[0].length
	const e = Array.from({ length: dim }, () => [])
	for (let i = 0; i < n; i++) {
		for (let d = 0; d < dim; d++) {
			e[d][i] = Math.abs(pred[i][d] - t[i][d])
		}
	}
	return e.map(v => {
		for (let d = 0; d < dim; d++) {
			v.sort((a, b) => a - b)
		}
		return v.length % 2 === 1 ? v[(v.length - 1) / 2] : (v[v.length / 2] + v[v.length / 2 - 1]) / 2
	})
}

/**
 * Returns RMSPE (Root Mean Squared Percentage Error).
 * @param {number[] | Array<Array<number>>} pred Predicted values
 * @param {number[] | Array<Array<number>>} t True values
 * @returns {number | number[]} Root Mean Squared Percentage Error
 */
export function rmspe(pred, t) {
	const n = pred.length
	if (!Array.isArray(pred[0])) {
		let e = 0
		for (let i = 0; i < n; i++) {
			e += ((pred[i] - t[i]) / t[i]) ** 2
		}
		return Math.sqrt(e / n)
	}
	const dim = pred[0].length
	const e = Array(dim).fill(0)
	for (let i = 0; i < n; i++) {
		for (let d = 0; d < dim; d++) {
			e[d] += ((pred[i][d] - t[i][d]) / t[i][d]) ** 2
		}
	}
	return e.map(v => Math.sqrt(v / n))
}

/**
 * Returns MAPE (Mean Absolute Percentage Error).
 * @param {number[] | Array<Array<number>>} pred Predicted values
 * @param {number[] | Array<Array<number>>} t True values
 * @returns {number | number[]} Mean Absolute Percentage Error
 */
export function mape(pred, t) {
	const n = pred.length
	if (!Array.isArray(pred[0])) {
		let e = 0
		for (let i = 0; i < n; i++) {
			e += Math.abs((pred[i] - t[i]) / t[i])
		}
		return e / n
	}
	const dim = pred[0].length
	const e = Array(dim).fill(0)
	for (let i = 0; i < n; i++) {
		for (let d = 0; d < dim; d++) {
			e[d] += Math.abs((pred[i][d] - t[i][d]) / t[i][d])
		}
	}
	return e.map(v => v / n)
}

/**
 * Returns MSLE (Mean Squared Logarithmic Error).
 * @param {number[] | Array<Array<number>>} pred Predicted values
 * @param {number[] | Array<Array<number>>} t True values
 * @returns {number | number[]} Mean Squared Logarithmic Error
 */
export function msle(pred, t) {
	const n = pred.length
	if (!Array.isArray(pred[0])) {
		let e = 0
		for (let i = 0; i < n; i++) {
			e += (Math.log(1 + pred[i]) - Math.log(1 + t[i])) ** 2
		}
		return e / n
	}
	const dim = pred[0].length
	const e = Array(dim).fill(0)
	for (let i = 0; i < n; i++) {
		for (let d = 0; d < dim; d++) {
			e[d] += (Math.log(1 + pred[i][d]) - Math.log(1 + t[i][d])) ** 2
		}
	}
	return e.map(v => v / n)
}

/**
 * Returns RMSLE (Root Mean Squared Logarithmic Error).
 * @param {number[] | Array<Array<number>>} pred Predicted values
 * @param {number[] | Array<Array<number>>} t True values
 * @returns {number | number[]} RootMean Squared Logarithmic Error
 */
export function rmsle(pred, t) {
	const e = msle(pred, t)
	if (!Array.isArray(e)) {
		return Math.sqrt(e)
	}
	return e.map(Math.sqrt)
}

/**
 * Returns R2 (coefficient of determination).
 * @param {number[] | Array<Array<number>>} pred Predicted values
 * @param {number[] | Array<Array<number>>} t True values
 * @returns {number | number[]} Coefficient of determination
 */
export function r2(pred, t) {
	const n = pred.length
	if (!Array.isArray(pred[0])) {
		const mt = t.reduce((s, v) => s + v, 0) / n
		const den = t.reduce((s, v) => s + (v - mt) ** 2, 0)
		const num = t.reduce((s, v, i) => s + (v - pred[i]) ** 2, 0)
		return 1 - num / den
	}
	const dim = pred[0].length
	const e = []
	for (let d = 0; d < dim; d++) {
		const mt = t.reduce((s, v) => s + v[d], 0) / n
		const den = t.reduce((s, v) => s + (v[d] - mt) ** 2, 0)
		const num = t.reduce((s, v, i) => s + (v[d] - pred[i][d]) ** 2, 0)
		e[d] = 1 - num / den
	}
	return e
}

/**
 * Returns correlation.
 * @function
 * @param {number[] | Array<Array<number>>} pred Predicted values
 * @param {number[] | Array<Array<number>>} t True values
 * @returns {number | number[]} Correlation
 */
export function correlation(pred, t) {
	const n = pred.length
	if (!Array.isArray(pred[0])) {
		const pm = pred.reduce((s, v) => s + v, 0) / n
		const tm = t.reduce((s, v) => s + v, 0) / n
		const pv = pred.reduce((s, v) => s + (v - pm) ** 2, 0) / n
		const tv = t.reduce((s, v) => s + (v - tm) ** 2, 0) / n
		const cv = pred.reduce((s, v, i) => s + (v - pm) * (t[i] - tm), 0) / n
		return cv / Math.sqrt(pv * tv)
	}
	const dim = pred[0].length
	const e = []
	for (let d = 0; d < dim; d++) {
		const pm = pred.reduce((s, v) => s + v[d], 0) / n
		const tm = t.reduce((s, v) => s + v[d], 0) / n
		const pv = pred.reduce((s, v) => s + (v[d] - pm) ** 2, 0) / n
		const tv = t.reduce((s, v) => s + (v[d] - tm) ** 2, 0) / n
		const cv = pred.reduce((s, v, i) => s + (v[d] - pm) * (t[i][d] - tm), 0) / n
		e[d] = cv / Math.sqrt(pv * tv)
	}
	return e
}
