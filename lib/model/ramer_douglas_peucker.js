/**
 * Ramer-Douglas-Peucker algorithm
 */
export default class RamerDouglasPeucker {
	// https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm
	// https://siguniang.wordpress.com/2012/07/16/ramer-douglas-peucker-algorithm/
	/**
	 * @param {number} e
	 */
	constructor(e = 0.1) {
		this._e = e
	}

	_d(l1, l2, p) {
		return (
			Math.abs((l2[1] - l1[1]) * p[0] - (l2[0] - l1[0]) * p[1] + l2[0] * l1[1] - l2[1] * l1[0]) /
			Math.sqrt((l2[1] - l1[1]) ** 2 + (l2[0] - l1[0]) ** 2)
		)
	}

	/**
	 * Fit model.
	 * @param {number[]} x
	 * @param {number[]} y
	 */
	fit(x, y) {
		const n = x.length
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		x = d.map(v => v[0])
		y = d.map(v => v[1])

		const seg = [[0, n - 1]]
		while (true) {
			let max_d = 0
			let max_i = -1
			let max_k = -1
			for (let i = 0; i < seg.length; i++) {
				const l1 = [x[seg[i][0]], y[seg[i][0]]]
				const l2 = [x[seg[i][1]], y[seg[i][1]]]
				for (let k = seg[i][0] + 1; k < seg[i][1]; k++) {
					const d = this._d(l1, l2, [x[k], y[k]])
					if (d > max_d) {
						max_d = d
						max_i = i
						max_k = k
					}
				}
			}
			if (max_d === 0 || max_d < this._e) {
				break
			}
			seg.splice(max_i, 1, [seg[max_i][0], max_k], [max_k, seg[max_i][1]])
		}
		this._x = x
		this._y = y
		this._seg = seg
	}

	/**
	 * Returns predicted values.
	 * @param {number[]} x
	 * @returns {number[]}
	 */
	predict(x) {
		const n = this._x.length
		return x.map(v => {
			if (v <= this._x[0]) {
				return this._y[0]
			} else if (v >= this._x[n - 1]) {
				return this._y[n - 1]
			}
			for (const [s, e] of this._seg) {
				if (v < this._x[e]) {
					return this._y[s] + ((v - this._x[s]) * (this._y[e] - this._y[s])) / (this._x[e] - this._x[s])
				}
			}
			return 0
		})
	}
}
