/**
 * Median Absolute Deviation
 */
export default class MAD {
	// Median Absolute Deviation from median
	// https://www.vdu.lt/cris/bitstream/20.500.12259/92994/4/Aleksas_Pantechovskis_md.pdf
	// https://eurekastatistics.com/using-the-median-absolute-deviation-to-find-outliers/
	constructor() {
		this._median = null
		this._mad = null
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} data Training data
	 */
	fit(data) {
		const n = data.length
		if (n === 0) {
			return
		}
		const d = data[0].length
		this._median = []
		this._mad = []
		for (let j = 0; j < d; j++) {
			let xj = data.map(v => v[j])
			xj.sort((a, b) => a - b)
			this._median[j] = n % 2 === 1 ? xj[(n - 1) / 2] : (xj[n / 2 - 1] + xj[n / 2]) / 2
			xj = xj.map(v => Math.abs(v - this._median[j]))
			xj.sort((a, b) => a - b)
			this._mad[j] = n % 2 === 1 ? xj[(n - 1) / 2] : (xj[n / 2 - 1] + xj[n / 2]) / 2
		}
	}

	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		return data.map(x => {
			let max = -Infinity
			for (let i = 0; i < x.length; i++) {
				const v = Math.abs(x[i] - this._median[i]) / this._mad[i]
				max = Math.max(max, v)
			}
			return max
		})
	}
}
