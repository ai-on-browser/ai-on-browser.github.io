import { Matrix } from '../util/math.js'

import SplineInterpolation from './spline_interpolation.js'

/**
 * Spline smoothing
 */
export default class SmoothingSpline {
	// https://www.slideshare.net/YusukeKaneko6/hastiechapter5
	// http://www.math.keio.ac.jp/~kei/GDS/2nd/spline.html
	// http://www.msi.co.jp/splus/usersCase/edu/pdf/takezawa.pdf
	// https://en.wikipedia.org/wiki/Smoothing_spline
	/**
	 * @param {number} l
	 */
	constructor(l) {
		this._l = l
	}

	/**
	 * Fit model.
	 *
	 * @param {number[]} x
	 * @param {number[]} y
	 */
	fit(x, y) {
		const t = x.map((v, i) => [v, y[i], i])
		t.sort((a, b) => a[0] - b[0])
		x = t.map(v => v[0])
		y = Matrix.fromArray(t.map(v => v[1]))
		const n = x.length

		const w = Matrix.zeros(n - 2, n - 2)
		const d = Matrix.zeros(n - 2, n)
		for (let i = 0; i < n - 2; i++) {
			const hi = x[i + 1] - x[i]
			const hi1 = x[i + 2] - x[i + 1]
			d.set(i, i, 1 / hi)
			d.set(i, i + 1, -1 / hi - 1 / hi1)
			d.set(i, i + 2, 1 / hi1)

			if (i > 0) {
				w.set(i - 1, i, hi / 6)
				w.set(i, i - 1, hi / 6)
			}
			w.set(i, i, (hi + hi1) / 3)
		}
		const a = d.tDot(w.inv()).dot(d)
		a.mult(this._l)
		for (let i = 0; i < n; i++) {
			a.addAt(i, i, 1)
		}

		const m = a.solve(y).value

		this._spline = new SplineInterpolation()
		this._spline.fit(x, m)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {number[]} data
	 * @returns {number[]}
	 */
	predict(data) {
		return this._spline.predict(data)
	}
}
