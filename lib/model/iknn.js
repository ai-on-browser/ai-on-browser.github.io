import Matrix from '../util/matrix.js'

/**
 *  Locally Informative K-Nearest Neighbor
 */
export default class IKNN {
	// IKNN: Informative K-Nearest Neighbor Pattern Classification
	// http://sonyis.me/paperpdf/pkdd07_song.pdf
	/**
	 * @param {number} k Number of neighbors
	 * @param {number} i Number of informative points
	 */
	constructor(k, i) {
		this._k = k
		this._i = i

		this._gamma = 2
	}

	_pr(xj, xi) {
		let v = 0
		for (let p = 0; p < xj.length; p++) {
			v += this._w[p] * (xi[p] - xj[p]) ** 2
		}
		return Math.exp(-v / this._gamma)
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		this._x = x
		this._y = y
		this._c = [...new Set(y)]

		const d = x[0].length
		this._w = Array(d).fill(0)
		this._eta = []
		for (let k = 0; k < this._c.length; k++) {
			const xk = this._x.filter((v, i) => this._y[i] === this._c[k])
			const vari = Matrix.fromArray(xk).variance(0).value
			for (let p = 0; p < d; p++) {
				this._w[p] += vari[p]
			}
			this._eta[k] = xk.length
		}
		this._w = this._w.map(v => v / this._c.length)
		this._eta = this._eta.map(v => v / this._x.length)

		this._logp2t = Array(this._x.length).fill(0)
		for (let i = 0; i < this._x.length; i++) {
			for (let j = 0; j < this._x.length; j++) {
				if (i !== j) {
					this._logp2t[i] += Math.log(1 - this._pr(this._x[i], this._x[j]))
				}
			}
			for (let k = 0; k < this._c.length; k++) {
				if (this._y[i] === this._c[k]) {
					this._logp2t[i] *= 1 - this._eta[k]
				}
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(data) {
		return data.map(v => {
			const d = this._x.map((x, i) => ({
				i,
				d: Math.sqrt(x.reduce((s, xj, j) => s + (v[j] - xj) ** 2, 0)),
				pr: this._pr(x, v),
			}))
			const z = d.reduce((s, v) => s + v.pr, 0)
			d.sort((a, b) => a.d - b.d)

			const info = []
			for (let k = 0; k < this._k; k++) {
				const pij = Math.exp(this._eta * Math.log(d[k].pr) + this._logp2t[d[k].i] - z)
				info.push({ info: -Math.log(1 - pij) * pij, i: d[k].i })
			}
			info.sort((a, b) => b.info - a.info)

			const clss = {}
			for (let k = 0; k < this._i && k < this._k; k++) {
				const i = info[k].i
				if (!clss[this._y[i]]) {
					clss[this._y[i]] = { category: this._y[i], count: 1, max_info: info[k].info }
				} else {
					clss[this._y[i]].count++
					clss[this._y[i]].max_info = Math.max(clss[this._y[i]].max_info, info[k].info)
				}
			}
			let max_count = 0
			let max_info = -Infinity
			let target_cat = null
			for (const k of Object.keys(clss)) {
				if (max_count < clss[k].count || (max_count === clss[k].count && clss[k].max_info < max_info)) {
					max_count = clss[k].count
					max_info = clss[k].max_info
					target_cat = clss[k].category
				}
			}
			return target_cat
		})
	}
}
