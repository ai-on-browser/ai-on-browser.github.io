/**
 * n-linear interpolation
 */
export default class NLinearInterpolation {
	// https://en.wikipedia.org/wiki/Multivariate_interpolation
	// https://en.wikipedia.org/wiki/Bilinear_interpolation
	/**
	 * Fit model parameters.
	 * @param {*[]} values Training data. Nested number array
	 * @param {Array<Array<number>>} grids Grid values for each axises
	 */
	fit(values, grids) {
		this._v = values
		this._grids = grids

		this._offset_idx = []
		const idx = Array(this._grids.length).fill(0)
		do {
			this._offset_idx.push(idx.concat())
			for (let i = idx.length - 1; i >= 0; i--) {
				if (!idx[i]) {
					idx[i] = 1
					break
				}
				idx[i] = 0
			}
		} while (idx.some(v => v === 1))
	}

	/**
	 * Returns predicted interpolated values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {(number | null)[]} Predicted values
	 */
	predict(x) {
		return x.map(t => {
			const i = []
			for (let d = 0; d < t.length; d++) {
				if (t[d] < this._grids[d][0] || this._grids[d][this._grids[d].length - 1] < t[d]) {
					return null
				}
				let k = -1
				for (let i = 0; i < this._grids[d].length && t[d] >= this._grids[d][i]; k = i++);
				i[d] = k === this._grids[d].length - 1 ? k - 1 : k
			}
			const values = this._offset_idx.map(off => off.reduce((v, f, d) => v[i[d] + f], this._v))

			for (let d = 0; d < this._grids.length; d++) {
				const v1 = this._grids[d][i[d]]
				const v2 = this._grids[d][i[d] + 1]

				const p = (t[d] - v1) / (v2 - v1)
				const vl2 = values.length / 2
				for (let k = 0; k < vl2; k++) {
					values[k] = values[k] + p * (values[k + vl2] - values[k])
				}

				values.length = vl2
			}
			return values[0]
		})
	}
}
