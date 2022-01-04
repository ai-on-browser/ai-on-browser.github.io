/**
 * Simple moving average
 */
export class SimpleMovingAverage {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	/**
	 * Returns smoothed values.
	 * @param {number[]} data
	 * @param {number} n
	 * @returns {number[]}
	 */
	predict(data, n) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const t = Math.min(n, i + 1)
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
	 * Returns smoothed values.
	 * @param {number[]} data
	 * @param {number} n
	 * @returns {number[]}
	 */
	predict(data, n) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const m = Math.max(0, i - n + 1)
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
	 * Returns smoothed values.
	 * @param {number[]} data
	 * @param {number} n
	 * @returns {number[]}
	 */
	predict(data, k) {
		const model = new SimpleMovingAverage()
		const p = model.predict(data, k)
		return model.predict(p, k)
	}
}
