/**
 * n-linear interpolation
 */
export default class NLinearInterpolation {
	// https://en.wikipedia.org/wiki/Multivariate_interpolation
	/**
	 * Fit model parameters.
	 * @param {*[]} values Nested number array
	 * @param {Array<Array<number>>} grids
	 */
	fit(values, grids) {
		this._v = values
		this._grids = grids
	}

	/**
	 * Returns predicted interpolated values.
	 * @param {Array<Array<number>>} x
	 * @returns {(number | null)[]}
	 */
	predict(x) {
		const maxLowIndex = (arr, v) => {
			let t = -1
			for (let i = 0; i < arr.length && v >= arr[i]; t = i++);
			return t === arr.length - 1 ? t - 1 : t
		}
		return x.map(t => {
			const i = t.map((v, d) => maxLowIndex(this._grids[d], v))
			for (let d = 0; d < i.length; d++) {
				if (i[d] < 0 || this._grids[d].length - 1 < i[d]) {
					return null
				}
			}
			const values = []
			for (let k = 0; k < 2 ** this._grids.length; k++) {
				values.push(
					k
						.toString(2)
						.padStart(this._grids.length, '0')
						.split('')
						.reduce((v, f, d) => (f === '0' ? v[i[d]] : v[i[d] + 1]), this._v)
				)
			}

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
