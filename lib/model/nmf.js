import { Matrix } from '../util/math.js'
/**
 * Non-negative matrix factorization
 */
export default class NMF {
	// https://abicky.net/2010/03/25/101719/
	// https://qiita.com/nozma/items/d8dafe4e938c43fb7ad1
	// http://lucille.sourceforge.net/blog/archives/000282.html
	constructor() {}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {number} [rd=0]
	 */
	init(x, rd = 0) {
		this._x = Matrix.fromArray(x).t
		if (this._x.value.some(v => v < 0)) {
			throw 'Non-negative Matrix Fractorization only can process non negative matrix.'
		}
		this._r = rd
		this._W = Matrix.random(this._x.rows, this._r)
		this._H = Matrix.random(this._r, this._x.cols)
	}

	/**
	 * Fit model.
	 */
	fit() {
		const n = this._W.rows
		const m = this._H.cols

		let WH = this._W.dot(this._H)
		for (let j = 0; j < m; j++) {
			for (let i = 0; i < this._r; i++) {
				let s = 0
				for (let k = 0; k < n; k++) {
					s += (this._W.at(k, i) * this._x.at(k, j)) / WH.at(k, j)
				}
				this._H.multAt(i, j, s)
			}
		}

		for (let j = 0; j < this._r; j++) {
			for (let i = 0; i < n; i++) {
				let s = 0
				for (let k = 0; k < m; k++) {
					s += (this._x.at(i, k) / WH.at(i, k)) * this._H.at(j, k)
				}
				this._W.multAt(i, j, s)
			}
		}
		this._W.div(this._W.sum(0))
	}

	/**
	 * Returns reduced datas.
	 *
	 * @returns {Array<Array<number>>}
	 */
	predict() {
		return this._H.t.toArray()
	}
}
