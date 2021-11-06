import { Matrix } from '../util/math.js'

/**
 * Vector Autoregressive model
 */
export default class VAR {
	// http://www.mi.u-tokyo.ac.jp/mds-oudan/lecture_document_2019_math7/%E6%99%82%E7%B3%BB%E5%88%97%E8%A7%A3%E6%9E%90%EF%BC%88%EF%BC%96%EF%BC%89_2019.pdf
	// http://japla.sakura.ne.jp/workshop/workshop/before_2005/time_fix03.pdf
	/**
	 * @param {number} p
	 */
	constructor(p) {
		this._p = p
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} data
	 */
	fit(data) {
		this._levinson(data)
	}

	_yuleWalker(x) {
		const n = x.length
		x = Matrix.fromArray(x)
		const m = x.cols

		const g = new Matrix(this._p * m, m)
		const G = new Matrix(this._p * m, this._p * m)
		for (let i = 0; i <= this._p; i++) {
			const s = x.sliceRow(0, n - i).tDot(x.sliceRow(i, n))
			s.div(n)
			if (i > 0) {
				g.set((i - 1) * m, 0, s)
			}
			if (i < this._p) {
				for (let k = 0; k < this._p - i; k++) {
					G.set(k * m, (i + k) * m, s)
					G.set((i + k) * m, k * m, s)
				}
			}
		}

		const as = G.solve(g)
		this._phi = []
		for (let i = 0; i < this._p; i++) {
			this._phi[i] = as.sliceRow(i * m, (i + 1) * m)
		}
	}

	_levinson(x) {
		const n = x.length
		x = Matrix.fromArray(x)
		const c = []
		for (let i = 0; i <= this._p; i++) {
			const s = x.sliceRow(0, n - i).tDot(x.sliceRow(i, n))
			s.div(n)
			c[i] = s
		}

		const v = []
		const u = []
		v[0] = u[0] = c[0]
		let a = []
		let b = []
		for (let m = 0; m < this._p; m++) {
			const w = c[m + 1].copy()
			for (let j = 0; j < m; j++) {
				w.sub(a[j].dot(c[m - j]))
			}
			const na = []
			const nb = []
			na[m] = w.dot(u[m].inv())
			nb[m] = w.tDot(v[m].inv())
			for (let j = 0; j < m; j++) {
				na[j] = a[j].copySub(na[m].dot(b[m - j - 1]))
				nb[j] = b[j].copySub(nb[m].dot(a[m - j - 1]))
			}
			v[m + 1] = c[0].copy()
			u[m + 1] = c[0].copy()
			for (let j = 0; j < m + 1; j++) {
				v[m + 1].sub(na[j].dot(c[j + 1].t))
				u[m + 1].sub(nb[j].dot(c[j + 1]))
			}
			a = na
			b = nb
		}
		this._phi = a
	}

	/**
	 * Returns predicted future values.
	 * @param {Array<Array<number>>} data
	 * @param {number} k
	 * @returns {Array<Array<number>>}
	 */
	predict(data, k) {
		const preds = []
		const lasts = data.slice(data.length - this._p)
		lasts.reverse()
		for (let i = 0; i < k; i++) {
			const pred = Matrix.zeros(data[0].length, 1)
			for (let t = 0; t < this._p; t++) {
				pred.add(this._phi[t].dot(Matrix.fromArray(lasts[t])))
			}
			preds.push(pred.value)
			lasts.unshift(pred.value)
			lasts.pop()
		}
		return preds
	}
}