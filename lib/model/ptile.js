/**
 * P-tile thresholding
 */
export default class PTile {
	// http://www.clg.niigata-u.ac.jp/~lee/jyugyou/img_processing/medical_image_processing_02_press.pdf
	/**
	 * @param {number} [p=0.5] Percentile value
	 */
	constructor(p = 0.5) {
		this._p = p
	}

	/**
	 * Returns thresholded values.
	 *
	 * @param {number[]} x Training data
	 * @returns {(0 | 1)[]} Predicted values
	 */
	predict(x) {
		const xs = x.concat()
		xs.sort((a, b) => a - b)
		const n = this._p * (xs.length - 1)
		const n0 = Math.floor(n)
		if (n === n0) {
			this._t = xs[n0]
		} else {
			this._t = xs[n0] * (n - n0) + xs[n0 + 1] * (1 - n + n0)
		}
		return x.map(v => (v < this._t ? 0 : 1))
	}
}
