export default class SecondOrderPerceptron {
	// http://www.datascienceassn.org/sites/default/files/Second-order%20Perception%20Algorithm.pdf
	// A SECOND-ORDER PERCEPTRON ALGORITHM. (2005)
	constructor(a = 1) {
		this._v = null
		this._s = null
		this._a = a
	}

	_w() {
		const s = Matrix.eye(this._d, this._d, this._a)
		s.add(this._s.dot(this._s.t))
		return s.slove(this._v)
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y

		this._d = this._x.cols
		this._v = Matrix.zeros(this._d, 1)
		this._s = Matrix.zeros(this._d, 0)
	}

	update(x, y) {
		this._s = this._s.concat(x, 1)
		const w = this._w()
		const m = w.tDot(x).value[0]
		if (m * y > 0) return

		this._v.add(x.copyMult(y))
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._shift)
		const r = x.dot(this._w())
		return r.value
	}
}
