import { Matrix } from '../util/math.js'

export default class ARMA {
	// https://qiita.com/asys/items/622594cb482e01411632
	// http://www.lec.ac.jp/pdf/activity/kiyou/no04/04.pdf
	constructor(p, q) {
		this._p = p
		this._q = q
		this._rate = 0.1
		this._beta = 1.0e-5

		this._phi = []
		for (let i = 0; i < this._p; this._phi[i++] = 0);
		this._the = []
		for (let i = 0; i < this._q; this._the[i++] = 0.3);
	}

	fit(data) {
		const y = data
		const n = y.length

		const pq_max = Math.max(this._p, this._q)

		for (let k = 0; k < 1; k++) {
			this._u = [y[0]]
			for (let i = 1; i < n; i++) {
				let v = y[i]
				for (let j = 0; j < Math.min(i, this._p); j++) {
					v -= this._phi[j] * y[i - j - 1]
				}
				for (let j = 0; j < Math.min(i, this._q); j++) {
					v += this._the[j] * this._u[i - j - 1]
				}
				this._u[i] = v
			}
			let J = Matrix.zeros(n, this._p + this._q)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < Math.min(i, this._p); j++) {
					J.set(i, j, -y[i - j - 1])
				}
				for (let j = 0; j < Math.min(i, this._q); j++) {
					J.set(i, j + this._p, this._u[i - j - 1])
				}
			}
			J = J.sliceRow(pq_max)
			const f = new Matrix(n - pq_max, 1, this._u.slice(pq_max))

			const H = J.tDot(J)
			H.add(Matrix.eye(H.rows, H.cols, this._beta))
			const d = H.solve(J.tDot(f)).value
			let e = d.reduce((s, v, i) => s + Math.abs(v), 0)
			e /= this._phi.reduce((s, v) => s + Math.abs(v), 0) + this._the.reduce((s, v) => s + Math.abs(v), 0)
			if (isNaN(e) || e < 1.0e-12) break

			for (let i = 0; i < this._p; i++) {
				this._phi[i] -= this._rate * d[i]
			}
			for (let i = 0; i < this._q; i++) {
				this._the[i] -= this._rate * d[i + this._p]
			}
		}
	}

	predict(data, k) {
		const preds = []
		const lasts = data.slice(data.length - Math.max(this._p, this._q))
		lasts.reverse()
		for (let i = 0; i < k; i++) {
			let pred = 0
			for (let i = 0; i < this._p; i++) {
				pred += this._phi[i] * lasts[i]
			}
			pred += this._u[this._u.length - 1]
			for (let i = 0; i < this._q; i++) {
				pred -= this._u[this._u.length - i - 2] * this._the[i]
			}
			preds.push(pred)
			lasts.unshift(pred)
			lasts.pop()
		}
		return preds
	}
}
