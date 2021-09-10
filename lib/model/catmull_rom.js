export class CatmullRomSplines {
	// http://paulbourke.net/miscellaneous/interpolation/
	// https://github.com/FlexMonkey/Interpolation-Playground-/blob/master/InterpolationPlayground.playground/Contents.swift
	constructor() {}

	fit(x, y) {
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = d.map(v => v[0])
		this._y = d.map(v => v[1])
	}

	predict(target) {
		const n = this._x.length
		return target.map(t => {
			if (t <= this._x[0]) {
				return this._y[0]
			} else if (t >= this._x[n - 1]) {
				return this._y[n - 1]
			}
			for (let i = 1; i < n; i++) {
				if (t <= this._x[i]) {
					const p = (t - this._x[i - 1]) / (this._x[i] - this._x[i - 1])
					const y0 = i > 1 ? this._y[i - 2] : 2 * this._y[i - 1] - this._y[i]
					const y1 = this._y[i - 1]
					const y2 = this._y[i]
					const y3 = i < n - 1 ? this._y[i + 1] : 2 * this._y[i] + this._y[i - 1]
					const a0 = -0.5 * y0 + 1.5 * y1 - 1.5 * y2 + 0.5 * y3
					const a1 = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3
					const a2 = 0.5 * y2 - 0.5 * y0
					const a3 = y1
					return a0 * p ** 3 + a1 * p ** 2 + a2 * p + a3
				}
			}
			return this._y[n - 1]
		})
	}
}

export class CentripetalCatmullRomSplines {
	// https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
	constructor(alpha = 0.5) {
		this._alpha = alpha
	}

	fit(x, y) {
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = d.map(v => v[0])
		this._y = d.map(v => v[1])
	}

	predict(target) {
		const n = this._x.length
		return target.map(t => {
			if (t <= this._x[0]) {
				return this._y[0]
			} else if (t >= this._x[n - 1]) {
				return this._y[n - 1]
			}
			for (let i = 1; i < n; i++) {
				if (t <= this._x[i]) {
					let p = (t - this._x[i - 1]) / (this._x[i] - this._x[i - 1])
					const y0 = i > 1 ? this._y[i - 2] : 2 * this._y[i - 1] - this._y[i]
					const y1 = this._y[i - 1]
					const y2 = this._y[i]
					const y3 = i < n - 1 ? this._y[i + 1] : 2 * this._y[i] + this._y[i - 1]

					const t0 = 0
					const t1 = ((y0 - y1) ** 2) ** (this._alpha / 2) + t0
					const t2 = ((y1 - y2) ** 2) ** (this._alpha / 2) + t1
					const t3 = ((y2 - y3) ** 2) ** (this._alpha / 2) + t2

					p = t1 + (t2 - t1) * p

					const a1 = ((t1 - p) / (t1 - t0)) * y0 + ((p - t0) / (t1 - t0)) * y1
					const a2 = ((t2 - p) / (t2 - t1)) * y1 + ((p - t1) / (t2 - t1)) * y2
					const a3 = ((t3 - p) / (t3 - t2)) * y2 + ((p - t2) / (t3 - t2)) * y3

					const b1 = ((t2 - p) / (t2 - t0)) * a1 + ((p - t0) / (t2 - t0)) * a2
					const b2 = ((t3 - p) / (t3 - t1)) * a2 + ((p - t1) / (t3 - t1)) * a3

					const c = ((t2 - p) / (t2 - t1)) * b1 + ((p - t1) / (t2 - t1)) * b2
					return c
				}
			}
			return this._y[n - 1]
		})
	}
}
