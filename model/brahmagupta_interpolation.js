export default class BrahmaguptaInterpolation {
	// https://en.wikipedia.org/wiki/Brahmagupta%27s_interpolation_formula
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
					const y0 = i > 1 ? this._y[i - 2] : this._y[i - 1] * 2 - this._y[i]
					const d1 = this._y[i] - this._y[i - 1]
					const d0 = this._y[i - 1] - y0
					return ((d1 - d0) / 2) * p ** 2 + ((d1 + d0) / 2) * p + this._y[i - 1]
				}
			}
			return this._y[n - 1]
		})
	}
}