import Matrix from '../util/matrix.js'

/**
 * Sammon mapping
 */
export default class Sammon {
	// https://en.wikipedia.org/wiki/Sammon_mapping
	// https://oimokihujin.hatenablog.com/entry/2014/06/01/073231
	/**
	 * @param {Array<Array<number>>} x
	 * @param {number} rd
	 */
	constructor(x, rd) {
		this._x = x
		const n = this._x.length
		this._y = Matrix.randn(n, rd)
		this._alpha = 0.3

		this._d = Matrix.zeros(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				let d = 0
				for (let k = 0; k < x[i].length; k++) {
					d += (x[i][k] - x[j][k]) ** 2
				}
				d = Math.sqrt(d)
				this._d.set(i, j, d)
				this._d.set(j, i, d)
			}
		}
	}

	/**
	 * Fit model and returns reduced values.
	 *
	 * @returns {Array<Array<number>>}
	 */
	fit() {
		const c = this._d.sum()
		const n = this._y.rows
		const d = this._y.cols
		for (let i = 0; i < n; i++) {
			let de = Matrix.zeros(1, d)
			let dde = Matrix.zeros(1, d)
			for (let j = 0; j < n; j++) {
				if (i === j) continue
				let dp = 0
				for (let k = 0; k < d; k++) {
					dp += (this._y.at(i, k) - this._y.at(j, k)) ** 2
				}
				dp = Math.sqrt(dp)
				if (dp === 0) continue

				const t1 = (this._d.at(i, j) - dp) / (this._d.at(i, j) * dp)
				const t2 = this._y.row(i).copySub(this._y.row(j))
				de.sub(t2.copyMult((2 / c) * t1))
				dde.sub(t2.copyMap(v => (2 / c) * t1 * (1 - (v ** 2 / dp) * (1 / (this._d.at(i, j) - dp) + 1 / dp))))
			}

			for (let j = 0; j < d; j++) {
				this._y.subAt(i, j, (this._alpha * de.at(0, j)) / Math.abs(dde.at(0, j)))
			}
		}
		return this._y.toArray()
	}

	/**
	 * Returns reduced values.
	 *
	 * @returns {Array<Array<number>>}
	 */
	predict() {
		return this._y.toArray()
	}
}
