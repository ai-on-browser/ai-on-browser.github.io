import { Matrix } from '../util/math.js'

/**
 * Fuzzy c-means
 */
export default class FuzzyCMeans {
	// http://ibisforest.org/index.php?%E3%83%95%E3%82%A1%E3%82%B8%E3%82%A3c-means%E6%B3%95
	/**
	 * Constructor
	 * @param {number} m
	 */
	constructor(m = 2) {
		this._m = m
		this._c = []
		this._u = []
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas
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
			if (this._c.every(c => this._distance(cp, c) > 0)) {
				break
			}
		}
		this._c.push(cp.concat())
		const u = []
		const k = this._c.length
		for (let i = 0; i < this._x.length; i++) {
			const d = this._distance(this._c[k - 1], this._x[i])
			let v = 0
			for (let j = 0; j < k; j++) {
				v += (d / this._distance(this._c[j], this._x[i])) ** (1 / (this._m - 1))
			}
			u[i] = isNaN(v) ? 0 : 1 / v
		}
		this._u.push(u)
	}

	/**
	 * Fit model.
	 */
	fit() {
		const m = this._x[0].length
		const c = this._u.map(u => {
			const c = Array(m).fill(0)
			let s = 0
			for (let i = 0; i < this._x.length; i++) {
				s += u[i] ** this._m
				for (let d = 0; d < m; d++) {
					c[d] += this._x[i][d] * u[i] ** this._m
				}
			}
			return c.map(v => v / s)
		})
		for (let i = 0; i < this._x.length; i++) {
			const d = c.map(c => this._distance(this._x[i], c))
			for (let k = 0; k < c.length; k++) {
				let v = 0
				for (let j = 0; j < c.length; j++) {
					v += (d[k] / d[j]) ** (2 / (this._m - 1))
				}
				this._u[k][i] = 1 / v
			}
		}
		this._c = c
	}

	/**
	 * Returns predicted values.
	 * @returns {number[]}
	 */
	predict() {
		return Matrix.fromArray(this._u).argmax(0).value
	}
}
