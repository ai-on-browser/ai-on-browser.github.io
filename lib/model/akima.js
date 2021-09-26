/**
 * Akima interpolation
 */
export default class AkimaInterpolation {
	// https://slpr.sakura.ne.jp/qp/akima-interpolation/
	/**
	 * @param {boolean} modified
	 */
	constructor(modified = false) {
		this._modified = modified
	}

	/**
	 * Fit model parameters.
	 * @param {number[]} x
	 * @param {number[]} y
	 */
	fit(x, y) {
		const n = x.length
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = d.map(v => v[0])
		this._y = d.map(v => v[1])

		this._x1 = this._x[0] + this._x[1] - this._x[2]
		this._x0 = 2 * this._x[0] - this._x[2]
		const m1 = (this._y[2] - this._y[1]) / (this._x[2] - this._x[1])
		const m0 = (this._y[1] - this._y[0]) / (this._x[1] - this._x[0])
		this._y1 = this._y[0] - (this._x[0] - this._x1) * (2 * m0 - m1)
		this._y0 = this._y1 - (this._x1 - this._x0) * (3 * m0 - 2 * m1)

		this._xn0 = this._x[n - 1] + this._x[n - 2] - this._x[n - 3]
		this._xn1 = 2 * this._x[n - 1] - this._x[n - 3]
		const mn0 = (this._y[n - 3] - this._y[n - 2]) / (this._x[n - 3] - this._x[n - 2])
		const mn1 = (this._y[n - 2] - this._y[n - 1]) / (this._x[n - 2] - this._x[n - 1])
		this._yn0 = this._y[n - 1] - (this._xn0 - this._x[n - 1]) * (2 * mn1 - mn0)
		this._yn1 = this._y1 - (this._xn1 - this._xn0) * (3 * mn1 - 2 * mn0)
	}

	/**
	 * Returns predicted interpolated values.
	 * @param {number[]} target
	 * @returns {number[]}
	 */
	predict(target) {
		const n = this._x.length
		const x = this._x
		const y = this._y
		return target.map(t => {
			if (t <= x[0]) {
				return y[0]
			} else if (t >= x[n - 1]) {
				return y[n - 1]
			}
			let k = 1
			for (; t > x[k]; k++);
			if (t === x[k]) {
				return y[k]
			}
			const xs = [
				k === 1 ? this._x0 : k === 2 ? this._x1 : x[k - 3],
				k === 1 ? this._x1 : x[k - 2],
				x[k - 1],
				x[k],
				k === n - 1 ? this._xn0 : x[k + 1],
				k === n - 1 ? this._xn1 : k === n - 2 ? this._xn0 : x[k + 2],
			]
			const ys = [
				k === 1 ? this._y0 : k === 2 ? this._y1 : y[k - 3],
				k === 1 ? this._y1 : y[k - 2],
				y[k - 1],
				y[k],
				k === n - 1 ? this._yn0 : y[k + 1],
				k === n - 1 ? this._yn1 : k === n - 2 ? this._yn0 : y[k + 2],
			]
			const ms = []
			for (let i = 0; i < 5; i++) {
				ms[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i])
			}
			let w1, w2
			if (this._modified) {
				w1 =
					(Math.abs(ms[1] - ms[0]) + Math.abs(ms[1] + ms[0]) / 2) /
					(Math.abs(ms[3] - ms[2]) + Math.abs(ms[3] + ms[2]) / 2)
				w2 =
					(Math.abs(ms[2] - ms[1]) + Math.abs(ms[2] + ms[1]) / 2) /
					(Math.abs(ms[4] - ms[3]) + Math.abs(ms[4] + ms[3]) / 2)
			} else {
				w1 = Math.abs(ms[1] - ms[0]) / Math.abs(ms[3] - ms[2])
				w2 = Math.abs(ms[2] - ms[1]) / Math.abs(ms[4] - ms[3])
			}
			const q1 = (ms[1] - ms[2]) / (1 + w1)
			const q2 = (ms[3] - ms[2]) / (1 + w2)
			const a0 = ys[2]
			const a1 = q1 + ms[2]
			const a2 = (-1 * (2 * q1 + q2)) / (xs[3] - xs[2])
			const a3 = (q1 + q2) / (xs[3] - xs[2]) ** 2
			return a0 + a1 * (t - xs[2]) + a2 * (t - xs[2]) ** 2 + a3 * (t - xs[2]) ** 3
		})
	}
}
