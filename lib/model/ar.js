import { Matrix } from '../util/math.js'

export default class AR {
	// https://ja.wikipedia.org/wiki/%E8%87%AA%E5%B7%B1%E5%9B%9E%E5%B8%B0%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87%E3%83%A2%E3%83%87%E3%83%AB
	// https://qiita.com/yutera12/items/8502f0530f907354b56a
	// http://www.mi.u-tokyo.ac.jp/mds-oudan/lecture_document_2019_math7/%E6%99%82%E7%B3%BB%E5%88%97%E8%A7%A3%E6%9E%90%EF%BC%88%EF%BC%96%EF%BC%89_2019.pdf
	constructor(p) {
		this._p = p
	}

	fit(data) {
		this._lsm(data)
	}

	_lsm(x) {
		const n = x.length
		const g = new Matrix(n - this._p, 1, x.slice(this._p))
		const G = new Matrix(n - this._p, this._p)
		for (let i = 0; i < n - this._p; i++) {
			for (let j = 0; j < this._p; j++) {
				G.set(i, j, x[i + this._p - 1 - j])
			}
		}
		const Gx = G.tDot(G)

		this._phi = Gx.solve(G.t).dot(g)
		const s = G.dot(this._phi)
		s.sub(g)
		this._e = s.mean()
	}

	_yuleWalker(x) {
		const n = x.length
		const g = new Matrix(this._p, 1)
		const G = new Matrix(this._p, this._p)
		const mean = x.reduce((s, v) => s + v, 0) / n
		for (let i = 0; i <= this._p; i++) {
			let s = 0
			for (let k = 0; k < n - i; k++) {
				s += (x[k] - mean) * (x[k + i] - mean)
			}
			s /= n
			if (i > 0) {
				g.set(i - 1, 0, s)
			}
			if (i < this._p) {
				for (let k = 0; k < this._p - i; k++) {
					G.set(k, i + k, s)
					G.set(i + k, k, s)
				}
			}
		}
		this._phi = G.solve(g)
		this._e = G.at(0, 0) - this._phi.tDot(g).value[0]
	}

	predict(data, k) {
		const preds = []
		const lasts = data.slice(data.length - this._p)
		lasts.reverse()
		for (let i = 0; i < k; i++) {
			const last = new Matrix(1, this._p, lasts)
			const pred = last.dot(this._phi).value[0] + this._e
			preds.push(pred)
			lasts.unshift(pred)
			lasts.pop()
		}
		return preds
	}
}
