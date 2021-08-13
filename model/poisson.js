export default class PoissonRegression {
	// https://en.wikipedia.org/wiki/Poisson_regression
	// https://oku.edu.mie-u.ac.jp/~okumura/stat/poisson_regression.html
	constructor(rate) {
		this._w = null
		this._r = rate
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		x = x.resize(x.rows, x.cols + 1, 1)
		y = Matrix.fromArray(y)
		if (!this._w) {
			this._w = Matrix.randn(x.cols, y.cols)
		}

		const dw1 = x.tDot(y)
		const dw2 = x.dot(this._w)
		dw2.map(v => Math.exp(v))
		dw1.sub(x.tDot(dw2))
		dw1.mult(this._r / x.rows)

		this._w.add(dw1)
	}

	predict(x) {
		x = Matrix.fromArray(x)
		x = x.resize(x.rows, x.cols + 1, 1)
		return x
			.dot(this._w)
			.copyMap(v => Math.exp(v))
			.toArray()
	}
}
