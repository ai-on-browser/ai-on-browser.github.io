/**
 * Delayed Cluster Dirichlet Processes algorithm
 */
export default class DCDPMeans {
	// Revisiting DP-Means: Fast Scalable Algorithms via Parallelism and Delayed Cluster Creation
	// https://proceedings.mlr.press/v180/dinari22b/dinari22b.pdf
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
		let j_max = -1
		let d_max = -1
		for (let i = 0; i < n; i++) {
			let min_d = Infinity
			for (let k = 0; k < this._c.length; k++) {
				const d = this._d(datas[i], this._c[k])
				if (d < min_d) {
					min_d = d
					z[i] = k
				}
			}
			if (min_d > d_max) {
				d_max = min_d
				j_max = i
			}
		}
		if (d_max > this._l) {
			this._c.push(datas[j_max].concat())
			z[j_max] = this._c.length - 1
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
