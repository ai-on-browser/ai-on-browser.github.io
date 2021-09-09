import { Matrix } from '../js/math.js'

export default class ADALINE {
	// https://qiita.com/ruka38/items/2f2f958c1d45728ea577
	// https://qiita.com/kazukiii/items/958fa06079a0e5a73007
	constructor(rate) {
		this._r = rate
		this._a = x => x
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._y = Matrix.fromArray(train_y)
		this._epoch = 0

		this._w = Matrix.randn(this._x.cols, 1)
		this._b = 0
	}

	fit() {
		const o = this._x.dot(this._w)
		o.map(v => this._a(v + this._b))

		const e = this._y.copySub(o)
		const dw = this._x.tDot(e)
		dw.mult(this._r / this._x.rows)
		this._w.add(dw)
		this._b += (e.sum() * this._r) / this._x.rows
	}

	predict(data) {
		const x = Matrix.fromArray(data)
		return x.dot(this._w).value.map(v => (this._a(v + this._b) <= 0 ? -1 : 1))
	}
}
