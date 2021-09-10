import { Matrix } from '../util/math.js'

export default class PLS {
	constructor(l) {
		this._l = l
	}

	init(x, y) {
		this._x = Matrix.fromArray(x)
		this._y = Matrix.fromArray(y)
	}

	fit() {
		if (this._y.cols === 1) {
			;[this._b, this._b0] = this._pls1()
		} else {
			throw ''
		}
	}

	_pls1() {
		// https://ja.wikipedia.org/wiki/部分的最小二乗回帰
		let x = this._x.copy()
		let w = x.tDot(this._y)
		w.div(w.norm())

		const ws = []
		const ps = []
		const qs = []
		for (let k = 0; k < this._l; k++) {
			const t = x.dot(w)
			const tk = t.tDot(t).value[0]
			t.div(tk)
			const p = x.tDot(t)
			const qk = this._y.tDot(t).value[0]

			ps.push(p.value)
			qs.push(qk)
			ws.push(w.value)
			if (qk === 0) break

			const xsub = t.dot(p.t)
			xsub.mult(tk)
			x.sub(xsub)
			w = x.tDot(this._y)
		}
		const W = Matrix.fromArray(ws).t
		const P = Matrix.fromArray(ps).t
		const q = new Matrix(qs.length, 1, qs)

		const B = W.dot(P.tDot(W).solve(q))
		const B0 = qs[0] - P.col(0).tDot(B).value[0]
		return [B, B0]
	}

	predict(x) {
		x = Matrix.fromArray(x)
		return x.dot(this._b).copyAdd(this._b0).toArray()
	}
}
