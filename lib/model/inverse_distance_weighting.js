/**
 * Inverse distance weighting
 */
export default class InverseDistanceWeighting {
	// https://en.wikipedia.org/wiki/Inverse_distance_weighting
	// http://paulbourke.net/miscellaneous/interpolation/
	/**
	 * @param {number} [k=5] Number of neighborhoods
	 * @param {number} [p=2] Power parameter
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski'} [metric=euclid] Metric name
	 */
	constructor(k = 5, p = 2, metric = 'euclid') {
		this._k = k
		this._p = p

		this._metric = metric
		switch (this._metric) {
			case 'euclid':
				this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
				break
			case 'manhattan':
				this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
				break
			case 'chebyshev':
				this._d = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])))
				break
			case 'minkowski':
				this._dp = 2
				this._d = (a, b) =>
					Math.pow(
						a.reduce((s, v, i) => s * (v - b[i]) ** this._dp, 0),
						1 / this._dp
					)
				break
		}
	}

	_near_points(data) {
		const ps = []
		this._x.forEach((p, i) => {
			const d = this._d(data, p)
			if (ps.length < this._k || d < ps[this._k - 1].d) {
				if (ps.length >= this._k) ps.pop()
				ps.push({
					d: d,
					value: this._y[i],
					idx: i,
				})
				for (let k = ps.length - 1; k > 0; k--) {
					if (ps[k - 1].d > ps[k].d) {
						;[ps[k], ps[k - 1]] = [ps[k - 1], ps[k]]
					}
				}
			}
		})
		return ps
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {number[]} y Target values
	 */
	fit(x, y) {
		this._x = x
		this._y = y
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		return data.map(t => {
			const ps = this._near_points(t)
			if (ps[0].d === 0) {
				return ps[0].value
			}
			let w = 0
			let u = 0
			for (let i = 0; i < ps.length; i++) {
				const wi = 1 / ps[i].d ** this._p
				u += wi * ps[i].value
				w += wi
			}
			return u / w
		})
	}
}
