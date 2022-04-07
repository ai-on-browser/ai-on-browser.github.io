/**
 * Sinc interpolation
 */
export default class SincInterpolation {
	// https://ja.wikipedia.org/wiki/%E5%86%85%E6%8C%BF
	/**
	 * Fit model parameters.
	 *
	 * @param {number[]} values Training data
	 */
	fit(values) {
		this._v = values
	}

	_sinc(x) {
		if (x === 0) {
			return 1
		}
		return Math.sin(Math.PI * x) / (Math.PI * x)
	}

	/**
	 * Returns predicted interpolated values.
	 *
	 * @param {number[]} index Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(index) {
		const n = this._v.length
		return index.map(t => {
			let v = 0
			for (let i = 0; i < n; i++) {
				const p = Math.abs(i - t)
				if (p === 0) {
					return this._v[i]
				} else {
					v += this._v[i] * this._sinc(p)
				}
			}
			return v
		})
	}
}
