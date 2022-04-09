import Matrix from '../util/matrix.js'

/**
 * Particle filter
 */
export default class ParticleFilter {
	// https://saltcooky.hatenablog.com/entry/2020/08/11/231716
	constructor() {
		this._n = 2000
		this._l = 20
		this._noise = 0.2
	}

	/**
	 * Fit and returns smoothed values.
	 *
	 * @param {Array<Array<number>>} z Training data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	fit(z) {
		const n = z.length
		const d = z[0].length
		z = Matrix.fromArray(z).t
		const xx = [Matrix.repeat(z.col(0), this._n, 1)]

		for (let i = 0; i < n; i++) {
			const x = Matrix.add(xx[i], Matrix.mult(Matrix.randn(d, this._n), this._noise))
			const w = Matrix.sub(z.col(i), x)
			w.map(v => Math.exp(-(v ** 2)))

			const wsum = [w.col(0).mean()]
			for (let j = 1; j < this._n; j++) {
				wsum[j] = wsum[j - 1] + w.col(j).mean()
			}
			const total = wsum[this._n - 1]
			const r = Math.floor(Math.random() * total)
			const pos = []
			for (let j = 0; j < this._n; j++) {
				pos[j] = ((j * total) / this._n + r) % total
			}
			const sp = []
			for (let j = 0; j < this._n; j++) {
				for (let k = 0; k < this._n; k++) {
					if (wsum[k] >= pos[j]) {
						sp[j] = k
						break
					}
				}
			}

			for (let j = 0; j < this._l; j++) {
				let p = i - (this._l - j)
				if (p < 0) p = 0
				xx[p] = xx[p].col(sp)
			}
			xx[i] = x.col(sp)
			xx[i + 1] = xx[i]
		}

		return xx.map(x => x.mean(1).value)
	}

	/**
	 * Returns predicted future values.
	 *
	 * @ignore
	 * @param {number} k Prediction count
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(k) {
		const pred = []
		return pred
	}
}
