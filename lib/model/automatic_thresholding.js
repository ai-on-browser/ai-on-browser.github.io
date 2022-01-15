/**
 * Automatic thresholding
 */
export default class AutomaticThresholding {
	// https://en.wikipedia.org/wiki/Thresholding_(image_processing)
	// http://www.math.tau.ac.il/~turkel/notes/otsu.pdf
	constructor() {
		this._th = null
	}

	/**
	 * Fit model.
	 *
	 * @param {number[]} x
	 */
	fit(x) {
		const n = x.length

		if (!this._th) {
			this._th = x.reduce((s, v) => s + v, 0) / n
		}

		let m1 = 0
		let m2 = 0
		let n1 = 0
		let n2 = 0
		for (let i = 0; i < n; i++) {
			if (x[i] < this._th) {
				m1 += x[i]
				n1++
			} else {
				m2 += x[i]
				n2++
			}
		}
		this._th = (m1 / n1 + m2 / n2) / 2
	}

	/**
	 * Returns thresholded values.
	 *
	 * @param {number[]} x
	 * @returns {(0 | 1)[]}
	 */
	predict(x) {
		return x.map(v => (v < this._th ? 0 : 1))
	}
}
