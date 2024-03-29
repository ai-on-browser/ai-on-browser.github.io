/**
 * Simple moving average
 */
export class SimpleMovingAverage {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	/**
	 * @param {number} n Window size
	 */
	constructor(n) {
		this._n = n
	}

	/**
	 * Returns smoothed values.
	 *
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const t = Math.min(this._n, i + 1)
			p[i] = 0
			for (let k = i - t + 1; k <= i; k++) {
				p[i] += data[k]
			}
			p[i] /= t
		}
		return p
	}
}

/**
 * Linear weighted moving average
 */
export class LinearWeightedMovingAverage {
	/**
	 * @param {number} n Window size
	 */
	constructor(n) {
		this._n = n
	}

	/**
	 * Returns smoothed values.
	 *
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const m = Math.max(0, i - this._n + 1)
			p[i] = 0
			let s = 0
			for (let k = m; k <= i; k++) {
				p[i] += (k - m + 1) * data[k]
				s += k - m + 1
			}
			p[i] /= s
		}
		return p
	}
}

/**
 * Triangular moving average
 */
export class TriangularMovingAverage {
	/**
	 * @param {number} k Window size
	 */
	constructor(k) {
		this._k = k
	}

	/**
	 * Returns smoothed values.
	 *
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const model = new SimpleMovingAverage(this._k)
		const p = model.predict(data)
		return model.predict(p)
	}
}
