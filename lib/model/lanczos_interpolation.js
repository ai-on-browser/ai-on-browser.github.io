/**
 * Lanczos interpolation
 */
export default class LanczosInterpolation {
	// https://ja.wikipedia.org/wiki/%E5%86%85%E6%8C%BF
	/**
	 * @param {number} n Order
	 */
	constructor(n) {
		this._n = n
	}

	/**
	 * Fit model parameters.
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
	 * @param {number[]} index Training data
	 * @returns {number[]} Predicted values
	 */
	predict(index) {
		const n = this._v.length
		return index.map(t => {
			let v = 0
			for (let i = Math.max(0, Math.floor(t - this._n)); i < Math.min(n, Math.ceil(t + this._n)); i++) {
				const p = Math.abs(i - t)
				if (p === 0) {
					return this._v[i]
				} else if (p <= this._n) {
					v += this._v[i] * this._sinc(p) * this._sinc(p / this._n)
				}
			}
			return v
		})
	}
}
