/**
 * Elkan's accelerated k-Means algorithm
 */
export default class ElkanKMeans {
	// Using the Triangle Inequality to Accelerate k-Means
	// https://cdn.aaai.org/ICML/2003/ICML03-022.pdf
	/**
	 * @param {number} k Number of clusters
	 */
	constructor(k) {
		this._k = k
		this._c = null
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
	 * Initialize this model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		const n = this._x.length
		this._c = [this._x[Math.floor(Math.random() * n)]]

		const xd = Array.from(this._x, () => [])
		for (let k = 1; k < this._k; k++) {
			for (let i = 0; i < n; i++) {
				xd[i][k - 1] = this._d(this._x[i], this._c[k - 1]) ** 2
			}
			const d = xd.map(d => d.reduce((m, c) => Math.min(m, c), Infinity))
			const s = d.reduce((acc, v) => acc + v, 0)
			let r = Math.random() * s
			let i = 0
			for (; i < d.length - 1; i++) {
				if (r < d[i]) {
					break
				}
				r -= d[i]
			}
			this._c.push(this._x[i])
		}

		const cd = []
		for (let i = 0; i < this._k; i++) {
			cd[i] = []
			cd[i][i] = 0
			for (let j = 0; j < i; j++) {
				cd[i][j] = cd[j][i] = this._d(this._c[i], this._c[j])
			}
		}
		this._p = []
		this._l = []
		this._u = []
		for (let i = 0; i < n; i++) {
			this._l[i] = Array(this._k.length).fill(0)
			this._p[i] = 0
			this._u[i] = this._l[i][0] = this._d(this._x[i], this._c[0])
			for (let k = 1; k < this._k; k++) {
				if (this._l[i][this._p[i]] * 2 <= cd[this._p[i]][k]) {
					continue
				}
				this._l[i][k] = this._d(this._x[i], this._c[k])
				if (this._l[i][k] < this._l[i][this._p[i]]) {
					this._p[i] = k
					this._u[i] = this._l[i][k]
				}
			}
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		const n = this._x.length
		const cd = []
		for (let i = 0; i < this._k; i++) {
			cd[i] = []
			cd[i][i] = 0
			for (let j = 0; j < i; j++) {
				cd[i][j] = cd[j][i] = this._d(this._c[i], this._c[j])
			}
		}
		const s = Array(this._k).fill(Infinity)
		for (let i = 0; i < this._k; i++) {
			for (let j = 0; j < this._k; j++) {
				if (i !== j && cd[i][j] < s[i]) {
					s[i] = cd[i][j]
				}
			}
			s[i] /= 2
		}
		const r = Array(n).fill(true)
		for (let i = 0; i < n; i++) {
			if (this._u[i] <= s[this._p[i]]) {
				continue
			}
			for (let k = 0; k < this._k; k++) {
				if (this._p[i] === k || this._u[i] <= this._l[i][k] || this._u[i] <= cd[this._p[i]][k] / 2) {
					continue
				}
				let d = this._u[i]
				if (r[i]) {
					d = this._l[i][this._p[i]] = this._d(this._x[i], this._c[this._p[i]])
					r[i] = false
				}
				if (d > this._l[i] || d > cd[this._p[i]][k] / 2) {
					this._l[i][k] = this._d(this._x[i], this._c[k])
					if (this._l[i][k] < d) {
						this._p[i] = k
					}
				}
			}
		}

		const mc = []
		const counts = Array(this._k).fill(0)
		for (let k = 0; k < this._k; k++) {
			mc[k] = Array(this._x[0].length).fill(0)
		}
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < this._x[i].length; j++) {
				mc[this._p[i]][j] += this._x[i][j]
			}
			counts[this._p[i]]++
		}
		const dmc = []
		for (let k = 0; k < this._k; k++) {
			mc[k] = mc[k].map(v => v / counts[k])
			dmc[k] = this._d(this._c[k], mc[k])
		}

		for (let i = 0; i < n; i++) {
			for (let k = 0; k < this._k; k++) {
				this._l[i][k] = Math.max(this._l[i][k] - dmc[k], 0)
			}
			this._u[i] += dmc[this._p[i]]
		}
		this._c = mc
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
