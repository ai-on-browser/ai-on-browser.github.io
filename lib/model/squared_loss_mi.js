import Matrix from '../util/matrix.js'

/**
 * Squared-loss Mutual information change point detection
 */
export class SquaredLossMICPD {
	// http://www.ms.k.u-tokyo.ac.jp/sugi/2015/JRSJ-jp.pdf
	/**
	 * @param {object} model Density ratio estimation model
	 * @param {function (Array<Array<number>>, Array<Array<number>>): void} model.fit Fit model
	 * @param {function (Array<Array<number>>): number[]} model.predict Returns predicted values
	 * @param {number} w Window size
	 * @param {number} [take] Take number
	 * @param {number} [lag] Lag
	 */
	constructor(model, w, take, lag) {
		this._model = model
		this._window = w
		this._take = take || Math.max(1, Math.floor(w / 2))
		this._lag = lag || Math.max(1, Math.floor(this._take / 2))
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const x = []
		for (let i = 0; i < datas.length - this._window + 1; i++) {
			x.push(datas.slice(i, i + this._window).flat())
		}

		const pred = []
		for (let i = 0; i < x.length - this._take - this._lag + 1; i++) {
			const h = Matrix.fromArray(x.slice(i, i + this._take))
			const t = Matrix.fromArray(x.slice(i + this._lag, i + this._take + this._lag))

			let c = 0
			this._model.fit(h, t)
			let dr = this._model.predict(t)
			for (let i = 0; i < dr.length; i++) {
				c += (dr[i] - 1) ** 2 / dr.length
			}
			this._model.fit(t, h)
			dr = this._model.predict(h)
			for (let i = 0; i < dr.length; i++) {
				c += (dr[i] - 1) ** 2 / dr.length
			}
			pred.push(c)
		}
		return pred
	}
}
