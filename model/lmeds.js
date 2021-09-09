import { Matrix } from '../js/math.js'

export default class LeastMedianSquaresRegression {
	// https://home.hiroshima-u.ac.jp/tkurita/lecture/statimage/node30.html
	// http://www-sop.inria.fr/odyssee/software/old_robotvis/Tutorial-Estim/node25.html
	constructor(k = 5) {
		this._w = null
		this._k = k
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const xh = x.resize(x.rows, x.cols + 1, 1)

		const [xs, idx] = xh.sampleRow(this._k, true)
		const ys = y.row(idx)
		const xtx = xs.tDot(xs)

		const w = xtx.solve(xs.tDot(ys))
		const yt = xh.dot(w)
		yt.sub(y)
		yt.mult(yt)

		const r = yt.sum(1).value
		r.sort((a, b) => a - b)

		const score = r.length % 2 === 1 ? r[(r.length - 1) / 2] : (r[r.length / 2 - 1] + r[r.length / 2]) / 2
		if (!this._w || score < this._score) {
			this._w = w
			this._score = score
		}
	}

	predict(x) {
		x = Matrix.fromArray(x)
		const xh = x.resize(x.rows, x.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
