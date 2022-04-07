/**
 * Soft k-means
 */
export default class SoftKMeans {
	// https://www.cs.cmu.edu/~02251/recitations/recitation_soft_clustering.pdf
	// http://soqdoq.com/teq/?p=686
	/**
	 * @param {number} [beta=1] Tuning parameter
	 */
	constructor(beta = 1) {
		this._beta = beta
		this._c = []
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Initialize model.
	 *
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
			if (this._c.every(c => this._distance(cp, c) > 0)) {
				break
			}
		}
		this._c.push(cp.concat())
	}

	_responsibility() {
		const r = []
		for (let i = 0; i < this._x.length; i++) {
			let s = 0
			const ri = []
			for (let k = 0; k < this._c.length; k++) {
				ri[k] = Math.exp(-this._beta * this._distance(this._c[k], this._x[i]))
				s += ri[k]
			}
			r.push(ri.map(v => v / s))
		}
		return r
	}

	/**
	 * Fit model.
	 */
	fit() {
		const r = this._responsibility()
		for (let k = 0; k < this._c.length; k++) {
			const c = Array(this._c[k].length).fill(0)
			let s = 0
			for (let i = 0; i < r.length; i++) {
				for (let j = 0; j < this._x[i].length; j++) {
					c[j] += r[i][k] * this._x[i][j]
				}
				s += r[i][k]
			}
			this._c[k] = c.map(v => v / s)
		}
	}

	/**
	 * Returns predicted responsibilities.
	 *
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict() {
		return this._responsibility()
	}
}
