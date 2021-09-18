import { Matrix } from '../util/math.js'

export default class PriestleyChao {
	// https://en.wikipedia.org/wiki/Kernel_regression
	// http://www.ma.man.ac.uk/~peterf/MATH38011/NPR%20P-C%20Estimator.pdf
	constructor(h) {
		this._h = h
		this._p = x => {
			const de = Math.sqrt(2 * Math.PI) ** x.cols
			const v = x.copyMult(x)
			const s = v.sum(1)
			s.map(v => Math.exp(-v / 2) / de)
			return s
		}
	}

	fit(x, y) {
		if (!this._h) {
			// Silverman's method
			const n = x.length
			const k = x.map(d => Math.sqrt(d.reduce((s, v) => s + v ** 2, 0)))
			const mean = k.reduce((s, v) => s + v, 0) / n
			const std = Math.sqrt(k.reduce((s, v) => s + (v - mean) ** 2, 0) / n)
			k.sort((a, b) => a - b)
			const q = p => {
				const np = n * p
				const np_l = Math.floor(np)
				const np_h = Math.ceil(np)
				return k[np_l] + (np_h - np_l) * (k[np_l] - k[np_h])
			}
			const sgm = Math.min(std, (q(0.75) - q(0.25)) / 1.34)

			this._h = (1.06 * sgm) / Math.pow(n, 0.2)
		}
		const d = x.map((v, i) => [v[0], y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = Matrix.fromArray(d.map(v => v[0]))
		this._x2 = this._x.sliceRow(1)
		this._xd = this._x2.copySub(this._x.sliceRow(0, x.length - 1))
		this._y = d.map(v => v[1])
	}

	predict(x) {
		const n = this._x2.rows
		return x.map(v => {
			const d = this._x2.copySub(new Matrix(1, 1, v[0]))
			d.div(this._h)
			const p = this._p(d)
			p.mult(this._xd)

			let s = 0
			for (let i = 0; i < n; i++) {
				s += this._y[i][0] * p.value[i]
			}
			return s / this._h
		})
	}
}