/**
 * Minimum error thresholding / Kittler-Illingworth Thresholding
 */
export default class KittlerIllingworthThresholding {
	// Minimum error thresholding
	// https://jp.mathworks.com/matlabcentral/fileexchange/45685-kittler-illingworth-thresholding
	// http://www.thothchildren.com/chapter/5bc4b10451d930518902af3b
	constructor() {}

	/**
	 * Returns thresholded values.
	 * @param {number[]} x Training data
	 * @returns {(0 | 1)[]} Predicted values
	 */
	predict(x) {
		this._cand = [...new Set(x)]
		this._cand.sort((a, b) => a - b)
		const n = this._cand.length

		let best_j = Infinity
		let best_t = 0
		for (let t = 2; t < n - 1; t++) {
			let p0 = 0
			let p1 = 0
			let m0 = 0
			let m1 = 0
			for (let i = 0; i < n; i++) {
				if (x[i] < this._cand[t]) {
					p0++
					m0 += x[i]
				} else {
					p1++
					m1 += x[i]
				}
			}
			const r0 = p0 / n
			const r1 = p1 / n
			m0 /= p0
			m1 /= p1

			let s1 = 0
			let s2 = 0
			for (let i = 0; i < n; i++) {
				if (x[i] < this._cand[t]) {
					s1 += (x[i] - m0) ** 2
				} else {
					s2 += (x[i] - m1) ** 2
				}
			}
			s1 /= p0
			s2 /= p1

			const j = r0 * Math.log(Math.sqrt(s1) / r0) + r1 * Math.log(Math.sqrt(s2) / r1)
			if (j < best_j) {
				best_j = j
				best_t = t
			}
		}
		this._t = this._cand[best_t]
		return x.map(v => (v < this._t ? 0 : 1))
	}
}
