import Matrix from '../util/matrix.js'

/**
 * Possibilistic c-means
 */
export default class PossibilisticCMeans {
	// https://github.com/holtskinner/PossibilisticCMeans
	/**
	 * @param {number} [m] Fuzziness factor
	 */
	constructor(m = 2) {
		this._m = m
		this._c = []
		this._u = []
		this._k = 1
	}

	_distance2(a, b) {
		return a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
	}

	/**
	 * Add a new cluster.
	 */
	add() {
		let cp = null
		while (true) {
			const i = Math.floor(Math.random() * this._x.length)
			cp = this._x[i]
			if (this._c.every(c => this._distance2(cp, c) > 0)) {
				break
			}
		}
		this._c.push(cp.concat())
		const u = []
		const d = this._x.map(v => this._distance2(cp, v))
		const eta = (this._k * d.reduce((s, v) => s + v, 0)) / d.length
		for (let i = 0; i < this._x.length; i++) {
			u[i] = 1 / (1 + (d[i] ** 2 / eta) ** (1 / (this._m - 1)))
		}
		this._u.push(u)
	}

	/**
	 * Fit model.
	 */
	fit() {
		const m = this._x[0].length
		for (let k = 0; k < this._u.length; k++) {
			const d = this._x.map(v => this._distance2(this._c[k], v))
			let s = 0
			let eta = 0
			for (let i = 0; i < this._x.length; i++) {
				s += this._u[k][i] ** this._m
				eta += d[i] * this._u[k][i] ** this._m
			}
			eta *= this._k / s

			for (let i = 0; i < this._x.length; i++) {
				this._u[k][i] = 1 / (1 + (d[i] / eta) ** (1 / (this._m - 1)))
			}
		}
		const c = []
		for (let k = 0; k < this._u.length; k++) {
			const ck = Array(m).fill(0)
			let s = 0
			for (let i = 0; i < this._x.length; i++) {
				s += this._u[k][i] ** this._m
				for (let j = 0; j < m; j++) {
					ck[j] += this._x[i][j] * this._u[k][i] ** this._m
				}
			}
			c.push(ck.map(v => v / s))
		}
		this._c = c
	}

	/**
	 * Returns predicted coefficients.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict() {
		return Matrix.fromArray(this._u).t.toArray()
	}
}
