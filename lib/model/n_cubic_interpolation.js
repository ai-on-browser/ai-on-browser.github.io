/**
 * n-cubic interpolation
 */
export default class NCubicInterpolation {
	// https://en.wikipedia.org/wiki/Multivariate_interpolation
	// https://en.wikipedia.org/wiki/Tricubic_interpolation
	/**
	 * Fit model parameters.
	 * @param {*[]} values Nested number array
	 * @param {Array<Array<number>>} grids
	 */
	fit(values, grids) {
		this._v = values
		this._grids = grids

		this._offset_idx = []
		for (let k = 0; k < 4 ** this._grids.length; k++) {
			this._offset_idx.push(k.toString(4).padStart(this._grids.length, '0').split(''))
		}
	}

	/**
	 * Returns predicted interpolated values.
	 * @param {Array<Array<number>>} x
	 * @returns {(number | null)[]}
	 */
	predict(x) {
		return x.map(t => {
			const i = []
			for (let d = 0; d < t.length; d++) {
				if (t[d] < this._grids[d][1] || this._grids[d][this._grids[d].length - 2] < t[d]) {
					return null
				}
				let k = -1
				for (let i = 0; i < this._grids[d].length && t[d] >= this._grids[d][i]; k = i++);
				i[d] = k === this._grids[d].length - 2 ? k - 1 : k
			}
			const values = this._offset_idx.map(off => off.reduce((v, f, d) => v[i[d] - 1 + +f], this._v))

			for (let d = 0; d < this._grids.length; d++) {
				const v1 = this._grids[d][i[d]]
				const v2 = this._grids[d][i[d] + 1]

				const p = (t[d] - v1) / (v2 - v1)
				const a0 = -(p ** 3) + 2 * p ** 2 - p
				const a1 = 3 * p ** 3 - 5 * p ** 2 + 2
				const a2 = -3 * p ** 3 + 4 * p ** 2 + p
				const a3 = p ** 3 - p ** 2

				const vl4 = values.length / 4
				for (let k = 0; k < vl4; k++) {
					values[k] =
						(a0 * values[k] + a1 * values[k + vl4] + a2 * values[k + 2 * vl4] + a3 * values[k + 3 * vl4]) /
						2
				}

				values.length = vl4
			}
			return values[0]
		})
	}
}
