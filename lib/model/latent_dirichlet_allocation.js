/**
 * Latent dirichlet allocation
 */
export default class LatentDirichletAllocation {
	// https://shuyo.hatenablog.com/entry/20110214/lda
	/**
	 * @param {number} [t] Topic count
	 */
	constructor(t = 2) {
		this._k = t
		this._alpha = 0.1
		this._beta = 0.1
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<*>>} x Training data
	 */
	init(x) {
		const x_cand = new Set()
		for (let i = 0; i < x.length; i++) {
			for (let j = 0; j < x[i].length; j++) {
				x_cand.add(x[i][j])
			}
		}
		this._x_cand = [...x_cand]

		this._w = x.map(d => d.map(v => this._x_cand.indexOf(v)))
		this._zmn = []
		this._nmz = Array.from(this._w, () => Array(this._k).fill(this._alpha))
		this._nzt = Array.from({ length: this._k }, () => Array(this._x_cand.length).fill(this._beta))
		this._nz = Array(this._k).fill(this._beta * this._x_cand.length)

		this._n = 0
		for (let m = 0; m < this._w.length; m++) {
			this._n += this._w[m].length
			this._zmn[m] = []
			for (let k = 0; k < this._w[m].length; k++) {
				const z = Math.floor(Math.random() * this._k)
				this._zmn[m][k] = z

				this._nmz[m][z]++
				this._nzt[z][this._w[m][k]]++
				this._nz[z]++
			}
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		for (let m = 0; m < this._w.length; m++) {
			for (let k = 0; k < this._w[m].length; k++) {
				const z = this._zmn[m][k]
				this._nmz[m][z]--
				this._nzt[z][this._w[m][k]]--
				this._nz[z]--

				const pz = this._nzt.map((v, i) => (v[this._w[m][k]] * this._nmz[m][i]) / this._nz[i])
				const pz_sum = pz.reduce((s, v) => s + v, 0)

				let r = Math.random() * pz_sum
				let new_z = 0
				for (; new_z < this._k; new_z++) {
					r -= pz[new_z]
					if (r < 0) {
						break
					}
				}
				this._zmn[m][k] = new_z
				this._nmz[m][new_z]++
				this._nzt[new_z][this._w[m][k]]++
				this._nz[new_z]++
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._nmz.map(v => {
			let max_v = -Infinity
			let max_i = -1
			for (let i = 0; i < v.length; i++) {
				if (max_v < v[i]) {
					max_v = v[i]
					max_i = i
				}
			}
			return max_i
		})
	}
}
