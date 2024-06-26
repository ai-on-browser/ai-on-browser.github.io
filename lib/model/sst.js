import Matrix from '../util/matrix.js'

/**
 * Singular-spectrum transformation
 */
export default class SST {
	// https://blog.tsurubee.tech/entry/2017/10/11/221255
	/**
	 * @param {number} w Window size
	 * @param {number} [take] Take number
	 * @param {number} [lag] Lag
	 */
	constructor(w, take, lag) {
		this._window = w
		this._take = take || Math.max(1, Math.floor(w / 2))
		this._lag = lag || Math.max(1, Math.floor(this._take / 2))
	}

	/**
	 * Returns anomaly degrees.
	 * @param {number[]} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const x = []
		for (let i = 0; i < datas.length - this._window + 1; i++) {
			x.push(datas.slice(i, i + this._window))
		}

		const pred = []
		const k = Math.min(2, this._take)
		const selc = Array.from({ length: k }, (_, i) => i)
		for (let i = 0; i < x.length - this._take - this._lag + 1; i++) {
			const h = Matrix.fromArray(x.slice(i, i + this._take)).t
			const t = Matrix.fromArray(x.slice(i + this._lag, i + this._take + this._lag)).t

			const [u1] = h.svd()
			const um1 = u1.col(selc)
			const [u2] = t.svd()
			const um2 = u2.col(selc)
			const a = 1 - um1.tDot(um2).svd()[1][0] ** 2
			pred.push(a)
		}
		return pred
	}
}
