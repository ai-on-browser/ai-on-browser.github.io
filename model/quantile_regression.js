export default class QuantileRegression {
	// https://salad-bowl-of-knowledge.github.io/hp/statistics/2020/01/21/quantile_regression.html
	// https://en.wikipedia.org/wiki/Quantile_regression
	constructor(tau = 0.5, learningRate = 0.1) {
		this._tau = tau
		this._lr = learningRate
		this._w = null
	}

	set lr(value) {
		this._lr = value
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const n = x.rows
		const xh = x.resize(n, x.cols + 1, 1)

		if (this._w === null) {
			this._w = Matrix.randn(xh.cols, y.cols)
		}

		const p = xh.dot(this._w)
		const d = y.copySub(p)
		const indicator = d.copyMap(v => (v <= 0 ? 1 : 0))
		const g = indicator.copySub(this._tau)
		g.map(v => Math.abs(v))
		g.mult(d.copyMap(v => Math.sign(v)))
		const dw = xh.tDot(g)
		dw.mult(this._lr)

		this._w.add(dw)
	}

	predict(x) {
		x = Matrix.fromArray(x)
		let xh = x.resize(x.rows, x.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
