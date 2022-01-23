import Matrix from '../util/matrix.js'

/**
 * Autoregressive model
 */
export default class AR {
	// https://ja.wikipedia.org/wiki/%E8%87%AA%E5%B7%B1%E5%9B%9E%E5%B8%B0%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87%E3%83%A2%E3%83%87%E3%83%AB
	// https://qiita.com/yutera12/items/8502f0530f907354b56a
	// http://www.mi.u-tokyo.ac.jp/mds-oudan/lecture_document_2019_math7/%E6%99%82%E7%B3%BB%E5%88%97%E8%A7%A3%E6%9E%90%EF%BC%88%EF%BC%96%EF%BC%89_2019.pdf
	/**
	 * @param {number} p
	 */
	constructor(p) {
		this._p = p
	}

	/**
	 * Fit model.
	 *
	 * @param {number[]} data
	 */
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
			s /= n - i
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
		this._variance = G.at(0, 0) - this._phi.tDot(g).toScaler()
	}

	_levinson(x) {
		const n = x.length
		const c = []
		const mean = x.reduce((s, v) => s + v, 0) / n
		for (let i = 0; i <= this._p; i++) {
			let s = 0
			for (let k = 0; k < n - i; k++) {
				s += (x[k] - mean) * (x[k + i] - mean)
			}
			s /= n - i
			c[i] = s
		}

		const v = []
		v[0] = c[0]
		let a = []
		for (let m = 0; m < this._p; m++) {
			const na = []
			na[m] = c[m + 1]
			for (let j = 0; j < m; j++) {
				na[m] -= a[j] * c[m - j]
			}
			na[m] /= v[m]
			for (let j = 0; j < m; j++) {
				na[j] = a[j] - na[m] * a[m - j - 1]
			}
			v[m + 1] = v[m] * (1 - na[m] ** 2)
			a = na
		}
		this._phi = Matrix.fromArray(a)
	}

	_householder(x) {
		const n = x.length
		const Z = new Matrix(n - this._p, this._p + 1)
		for (let i = 0; i < n - this._p; i++) {
			for (let j = 0; j < this._p; j++) {
				Z.set(i, j, x[i + this._p - 1 - j])
			}
			Z.set(i, this._p, x[i + this._p])
		}

		const [, s] = Z.qr()

		const sx = s.block(0, 0, this._p, this._p)
		const sy = s.block(0, this._p, this._p, this._p + 1)

		this._phi = sx.solveUpperTriangular(sy)
	}

	/**
	 * Returns predicted future values.
	 *
	 * @param {number[]} data
	 * @param {number} k
	 * @returns {number[]}
	 */
	predict(data, k) {
		const preds = []
		const lasts = data.slice(data.length - this._p)
		lasts.reverse()
		for (let i = 0; i < k; i++) {
			const last = new Matrix(1, this._p, lasts)
			const pred = last.dot(this._phi).toScaler()
			preds.push(pred)
			lasts.unshift(pred)
			lasts.pop()
		}
		return preds
	}
}
