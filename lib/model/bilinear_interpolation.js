/**
 * Bilinear interpolation
 */
export default class BilinearInterpolation {
	// https://en.wikipedia.org/wiki/Bilinear_interpolation
	/**
	 * Fit model parameters.
	 *
	 * @param {Array<Array<number>>} values
	 * @param {[number[], number[]]} grids
	 */
	fit(values, grids) {
		this._v = values
		this._grids = grids
	}

	/**
	 * Returns predicted interpolated values.
	 *
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
			const x1i = maxLowIndex(this._grids[0], t[0])
			if (x1i < 0 || this._grids[0].length - 1 < x1i) {
				return null
			}
			const x2i = x1i + 1
			const x1 = this._grids[0][x1i]
			const x2 = this._grids[0][x2i]
			const y1i = maxLowIndex(this._grids[1], t[1])
			if (y1i < 0 || this._grids[1].length - 1 < y1i) {
				return null
			}
			const y2i = y1i + 1
			const y1 = this._grids[1][y1i]
			const y2 = this._grids[1][y2i]

			return (
				(this._v[x1i][y1i] * (x2 - t[0]) * (y2 - t[1]) +
					this._v[x2i][y1i] * (t[0] - x1) * (y2 - t[1]) +
					this._v[x1i][y2i] * (x2 - t[0]) * (t[1] - y1) +
					this._v[x2i][y2i] * (t[0] - x1) * (t[1] - y1)) /
				((x2 - x1) * (y2 - y1))
			)
		})
	}
}
