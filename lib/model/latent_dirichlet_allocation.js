import Matrix from '../util/matrix.js'

/**
 * Latent dirichlet allocation
 */
export default class LatentDirichletAllocation {
	// https://shuyo.hatenablog.com/entry/20110214/lda
	/**
	 * @param {number} [t=2] Topic count
	 */
	constructor(t = 2) {
		this._k = t
		this._alpha = 0.1
		this._beta = 0.1
	}

	/**
	 * Initialize model.
	 *
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
		this._nmz = new Matrix(this._w.length, this._k, this._alpha)
		this._nzt = new Matrix(this._k, this._x_cand.length, this._beta)
		this._nz = this._nzt.sum(1)

		this._n = 0
		for (let m = 0; m < this._w.length; m++) {
			this._n += this._w[m].length
			this._zmn[m] = []
			for (let k = 0; k < this._w[m].length; k++) {
				const z = Math.floor(Math.random() * this._k)
				this._zmn[m][k] = z

				this._nmz.addAt(m, z, 1)
				this._nzt.addAt(z, this._w[m][k], 1)
				this._nz.addAt(z, 0, 1)
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
				this._nmz.subAt(m, z, 1)
				this._nzt.subAt(z, this._w[m][k], 1)
				this._nz.subAt(z, 0, 1)

				const pz = this._nzt.col(this._w[m][k])
				pz.mult(this._nmz.row(m).t)
				pz.div(this._nz)
				pz.div(pz.sum())

				let r = Math.random()
				let new_z = 0
				for (; new_z < this._k; new_z++) {
					r -= pz.at(new_z, 0)
					if (r < 0) {
						break
					}
				}
				this._zmn[m][k] = new_z
				this._nmz.addAt(m, new_z, 1)
				this._nzt.addAt(new_z, this._w[m][k], 1)
				this._nz.addAt(new_z, 0, 1)
			}
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._nmz.argmax(1).value
	}
}
