import { Matrix } from '../util/math.js'

/**
 * Incremental principal component analysis
 */
export default class IncrementalPCA {
	// https://catian.hatenadiary.org/entry/20081114/1226684726
	// https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.IncrementalPCA.html
	// https://www.cs.toronto.edu/~dross/ivt/RossLimLinYang_ijcv.pdf
	// https://www.jstage.jst.go.jp/article/ieejeiss/129/1/129_1_112/_pdf
	/**
	 * @param {number} [f=0.95]
	 */
	constructor(f = 0.95) {
		this._f = f
		this._batch_size = 0

		this._u = null
		this._s = null
		this._m = null
		this._n = 0
	}

	/**
	 * Update parameters.
	 *
	 * @param {Matrix} x
	 */
	update(x) {
		if (!this._u) {
			this._m = x.mean(1)
			x.sub(this._m)
			const [u, s] = x.svd()
			this._u = u
			this._s = s
			this._n = x.cols
			return
		}
		const m = x.cols
		const ib = x.mean(1)
		let bh = x.copySub(ib)
		const con = ib.copySub(this._m)
		con.mult(Math.sqrt((m * this._n) / (m + this._n)))
		bh = bh.concat(con, 1)

		const ob = this._u.dot(this._u.tDot(bh))
		ob.isub(bh)
		const [bt] = ob.qr()

		const r = Matrix.diag([...this._s.map(v => v * this._f), bt.dot(ob)])
		r.set(0, this._s.length, this._u.tDot(bh))

		const [ut, st] = r.svd()
		this._s = st
		this._u = this._u.concat(bt, 1).dot(ut)
		this._m.mult(this._n * this._f)
		this._m.add(ib.copyMult(m))
		this._m.div((this._n = this._n * this._f + m))
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 */
	fit(x) {
		x = Matrix.fromArray(x)
		if (this._batch_size <= 0) {
			this._batch_size = 5 * x.cols
		}
		for (let i = 0; i < x.rows; i += this._batch_size) {
			const r = []
			for (let k = 0; k < this._batch_size && i + k < x.rows; k++) {
				r[k] = i + k
			}
			this.update(x.row(r).t)
		}
	}

	/**
	 * Returns reduced datas.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {number} rd
	 * @returns {Array<Array<number>>}
	 */
	predict(x, rd) {
		x = Matrix.fromArray(x)
		let u = this._u
		if (rd > 0 && rd < u.cols) {
			u = u.resize(u.rows, rd)
		}
		return x.dot(u).toArray()
	}
}
