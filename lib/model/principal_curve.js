import Matrix from '../util/matrix.js'

import SmoothingSpline from './spline.js'

/**
 * Principal curves
 */
export default class PrincipalCurve {
	// https://omedstu.jimdofree.com/2019/09/29/principal-curve-%E5%85%A5%E9%96%80/
	// https://salad-bowl-of-knowledge.github.io/hp/statistics/2019/10/06/princurve2.html
	constructor() {
		this._l = null
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 */
	fit(x) {
		x = Matrix.fromArray(x)
		this._bending(x)
	}

	_bending(x) {
		x = Matrix.fromArray(x)
		const n = x.rows
		const m = x.cols

		let l = this._l
		if (!l) {
			const [u, s] = x.svd()
			l = u.col(0)
			l.mult(s[0])
		}
		const lp = 0.01
		const ln = 1000

		for (let i = 0; i < 1; i++) {
			const uniql = l.copy()
			const lidx = uniql.unique()
			const xidx = x.row(lidx)
			const f = []
			for (let k = 0; k < m; k++) {
				const spl = new SmoothingSpline(0.1)
				spl.fit(uniql.value, xidx.col(k).value)
				f.push(spl)
			}

			const lmin = l.min() - lp
			const lmax = l.max() + lp

			const seq = []
			for (let k = 0; k < ln; k++) {
				seq[k] = (k / (ln - 1)) * (lmax - lmin) + lmin
			}

			const fp = new Matrix(ln, m)
			for (let k = 0; k < m; k++) {
				const fs = f[k].predict(seq)
				for (let t = 0; t < ln; t++) {
					fp.set(t, k, fs[t])
				}
			}

			const new_lam = []
			for (let k = 0; k < n; k++) {
				const xd = Matrix.sub(fp, x.row(k))
				xd.map(v => v ** 2)
				new_lam[k] = seq[xd.sum(1).argmin(0).toScaler()]
			}
			l = Matrix.fromArray(new_lam)
		}
		this._l = l
	}

	/**
	 * Returns reduced datas.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict() {
		return this._l.toArray()
	}
}
