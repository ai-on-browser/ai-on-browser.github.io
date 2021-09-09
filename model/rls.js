import { Matrix } from '../js/math.js'

export default class RecursiveLeastSquares {
	// https://en.wikipedia.org/wiki/Online_machine_learning
	constructor() {
		this._w = null
		this._s = null
	}

	update(x, y) {
		const ds = this._s.dot(x).dot(x.tDot(this._s))
		ds.div(1 + x.tDot(this._s).dot(x).value[0])
		this._s.sub(ds)

		const dw = this._s.dot(x)
		dw.mult(x.tDot(this._w).value[0] - y)
		this._w.sub(dw)
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		const xh = x.resize(x.rows, x.cols + 1, 1)
		if (!this._w) {
			this._w = Matrix.zeros(xh.cols, 1)
			this._s = Matrix.eye(xh.cols, xh.cols)
		}
		for (let i = 0; i < x.rows; i++) {
			this.update(xh.row(i).t, y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data)
		const xh = x.resize(x.rows, x.cols + 1, 1)
		const r = xh.dot(this._w)
		return r.value
	}
}
