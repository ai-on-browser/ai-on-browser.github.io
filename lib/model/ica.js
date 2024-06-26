import Matrix from '../util/matrix.js'

import { PCA } from './pca.js'

/**
 * Independent component analysis
 */
export default class ICA {
	// https://www.slideshare.net/sfchaos/numpy-scipy-9039097
	/**
	 * @param {number | null} [rd] Reduced dimension
	 */
	constructor(rd = null) {
		this._w = null
		this._alpha = 0.1
		this._rd = rd ?? 0
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 */
	fit(x) {
		x = Matrix.fromArray(x)
		const d = x.cols
		if (!this._w) {
			this._w = Matrix.zeros(d, d)
		}
		x = Matrix.sub(x, x.mean(0))
		const pca = new PCA()
		pca.fit(x)
		const z = Matrix.fromArray(pca.predict(x))
		const eps = 1.0e-12
		const r = []

		for (let i = 0; i < d; i++) {
			let w = Matrix.randn(d, 1)
			if (i > 0) {
				const wi = this._w.slice(0, i)
				const k = wi.dot(w)
				wi.mult(k)
				w.sub(wi.sum(0).t)
			}
			w.div(w.norm())

			let maxCount = 1.0e4
			while (maxCount-- > 0) {
				const wx = z.dot(w)
				const gwx = Matrix.map(wx, v => Math.tanh(v * this._alpha))
				const xgwx = Matrix.mult(z, gwx)
				const v1 = xgwx.mean(0).t
				const g_wx = Matrix.map(wx, v => this._alpha * (1 - Math.tanh(this._alpha * v) ** 2))
				const v2 = Matrix.mult(w, g_wx.mean())
				const w1 = Matrix.sub(v1, v2)
				if (i > 0) {
					const wi = this._w.row(r)
					const k = wi.dot(w1)
					wi.mult(k)
					w1.sub(wi.sum(0).t)
				}
				w1.div(w1.norm())

				const e = Matrix.mult(w, w1)
				if (Math.abs(Math.abs(e.sum()) - 1) < eps) {
					break
				}
				w = w1
			}
			this._w.set(i, 0, w.t)
			r.push(i)
		}
	}

	/**
	 * Returns reduced datas.
	 * @param {Array<Array<number>>} x Training data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const w = this._w.t
		if (this._rd > 0 && this._rd < w.cols) {
			w.resize(w.rows, this._rd)
		}
		return x.dot(w).toArray()
	}
}
