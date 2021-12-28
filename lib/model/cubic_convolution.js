/**
 * Cubic-convolution interpolation
 */
export default class CubicConvolutionInterpolation {
	// https://ja.wikipedia.org/wiki/%E5%86%85%E6%8C%BF
	/**
	 * @param {number} a
	 */
	constructor(a) {
		this._a = a
	}

	/**
	 * Fit model parameters.
	 * @param {number[]} values
	 */
	fit(values) {
		this._v = values
	}

	/**
	 * Returns predicted interpolated values.
	 * @param {number[]} index
	 * @returns {number[]}
	 */
	predict(index) {
		const n = this._v.length
		return index.map(t => {
			let v = 0
			for (let i = Math.max(0, Math.floor(t - 2)); i < Math.min(n, Math.ceil(t + 2)); i++) {
				const p = Math.abs(i - t)
				if (p < 1) {
					const h = (this._a + 2) * p ** 3 - (this._a + 3) * p ** 2 + 1
					v += this._v[i] * h
				} else if (p < 2) {
					const h = this._a * p ** 3 - 5 * this._a * p ** 2 + 8 * this._a * p - 4 * this._a
					v += this._v[i] * h
				}
			}
			return v
		})
	}
}
