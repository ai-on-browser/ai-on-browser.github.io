export class SplineInterpolation {
	// https://en.wikipedia.org/wiki/Spline_interpolation
	constructor() {}

	fit(x, y) {
		const n = x.length
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		x = this._x = d.map(v => v[0])
		y = this._y = d.map(v => v[1])

		const A = Matrix.zeros(n, n)
		const B = new Matrix(n, 1)

		A.set(0, 0, 2 / (x[1] - x[0]))
		B.set(0, 0, (3 * (y[1] - y[0])) / (x[1] - x[0]) ** 2)
		for (let i = 1; i < n; i++) {
			A.set(i - 1, i, 1 / (x[i] - x[i - 1]))
			A.set(i, i - 1, 1 / (x[i] - x[i - 1]))
			if (i < n - 1) {
				A.set(i, i, 2 / (x[i] - x[i - 1]) + 2 / (x[i + 1] - x[i]))
				B.set(
					i,
					0,
					3 * ((y[i] - y[i - 1]) / (x[i] - x[i - 1]) ** 2 + (y[i + 1] - y[i]) / (x[i + 1] - x[i]) ** 2)
				)
			} else {
				A.set(i, i, 2 / (x[i] - x[i - 1]))
				B.set(i, 0, (3 * (y[i] - y[i - 1])) / (x[i] - x[i - 1]) ** 2)
			}
		}

		const K = A.slove(B).value
		this._a = []
		this._b = []
		for (let i = 0; i < n - 1; i++) {
			this._a.push(K[i] * (x[i + 1] - x[i]) - (y[i + 1] - y[i]))
			this._b.push(-K[i + 1] * (x[i + 1] - x[i]) + (y[i + 1] - y[i]))
		}
	}

	predict(target) {
		const n = this._x.length
		return target.map(v => {
			if (v < this._x[0]) {
				return this._y[0]
			}
			let i = 0
			for (; i < n - 1 && this._x[i + 1] <= v; i++);
			if (i === n - 1) {
				return this._y[n - 1]
			}

			const t = (v - this._x[i]) / (this._x[i + 1] - this._x[i])
			return (1 - t) * this._y[i] + t * this._y[i + 1] + t * (1 - t) * ((1 - t) * this._a[i] + t * this._b[i])
		})
	}
}
