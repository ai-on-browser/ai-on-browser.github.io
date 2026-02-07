/**
 * Dirichlet Processes algorithm
 */
export default class DPMeans {
	// Revisiting k-means: New Algorithms via Bayesian Nonparametrics
	// https://arxiv.org/abs/1111.0352
	/**
	 * @param {number} lambda cluster penalty parameter
	 */
	constructor(lambda) {
		this._l = lambda
		this._c = []
		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Centroids
	 * @type {Array<Array<number>>}
	 */
	get centroids() {
		return this._c
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	fit(datas) {
		const n = datas.length
		const d = datas[0].length
		if (this._c.length === 0) {
			this._c[0] = Array(d).fill(0)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < d; j++) {
					this._c[0][j] += datas[i][j]
				}
			}
			this._c[0] = this._c[0].map(v => v / n)
		}

		const z = Array(n)
		for (let i = 0; i < n; i++) {
			let min_d = Infinity
			for (let k = 0; k < this._c.length; k++) {
				const d = this._d(datas[i], this._c[k])
				if (d < min_d) {
					min_d = d
					z[i] = k
				}
			}
			if (min_d > this._l) {
				this._c.push(datas[i].concat())
				z[i] = this._c.length - 1
			}
		}

		const cn = Array.from(this._c, () => 0)
		this._c = Array.from(this._c, () => Array(d).fill(0))
		for (let i = 0; i < n; i++) {
			cn[z[i]]++
			for (let j = 0; j < d; j++) {
				this._c[z[i]][j] += datas[i][j]
			}
		}
		for (let k = 0; k < this._c.length; k++) {
			this._c[k] = this._c[k].map(v => v / cn[k])
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const p = []
		for (let i = 0; i < datas.length; i++) {
			let min_d = Infinity
			p[i] = -1
			for (let k = 0; k < this._c.length; k++) {
				const d = this._d(datas[i], this._c[k])
				if (d < min_d) {
					min_d = d
					p[i] = k
				}
			}
		}
		return p
	}
}
