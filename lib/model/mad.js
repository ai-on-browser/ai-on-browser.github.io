import { Matrix } from '../util/math.js'

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
	 * @param {Array<Array<number>>} data
	 */
	fit(data) {
		const n = data.length
		if (n === 0) {
			return
		}
		const x = Matrix.fromArray(data)
		this._median = x.median(0)
		x.sub(this._median)
		x.abs()
		this._mad = x.median(0)
	}

	/**
	 * Returns anomaly degrees.
	 * @param {Array<Array<number>>} data
	 * @returns {number[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._median)
		x.abs()
		x.div(this._mad)

		return x.max(1).value
	}
}
