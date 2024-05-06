import Matrix from '../util/matrix.js'

/**
 * Probabilistic latent semantic analysis
 */
export default class PLSA {
	// https://mieruca-ai.com/ai/plsa/
	// http://www.gifu-nct.ac.jp/elec/deguchi/sotsuron/yoshimura/node14.html
	/**
	 * @param {number} [k] Number of clusters
	 */
	constructor(k = 2) {
		this._k = k
		this._beta = 1
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
		this._w = [...x_cand]

		this._d = x.map(d => d.map(v => this._w.indexOf(v)))
		this._n = Matrix.zeros(this._d.length, this._w.length)
		for (let i = 0; i < this._d.length; i++) {
			for (let j = 0; j < this._d[i].length; j++) {
				this._n.addAt(i, this._d[i][j], 1)
			}
		}

		this._pz = Array(this._k).fill(1 / this._k)
		this._pwz = new Matrix(this._w.length, this._k, 1 / this._w.length)
		this._pdz = Matrix.random(this._d.length, this._k, 0, 1)
		this._pdz.div(this._pdz.sum(0))
		this._pzdw = []
		for (let i = 0; i < this._k; i++) {
			this._pzdw[i] = new Matrix(this._d.length, this._w.length, 1 / this._k)
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		for (let i = 0; i < this._d.length; i++) {
			for (let j = 0; j < this._w.length; j++) {
				const p = []
				for (let k = 0; k < this._k; k++) {
					p[k] = this._pz[k] * this._pdz.at(i, k) * this._pwz.at(j, k)
				}
				const s = p.reduce((s, v) => s + v, 0)
				for (let k = 0; k < this._k; k++) {
					this._pzdw[k].set(i, j, p[k] / (s + 1.0e-12))
				}
			}
		}

		for (let k = 0; k < this._k; k++) {
			const np = Matrix.mult(this._n, this._pzdw[k])
			const dw = np.sum(0)
			dw.div(dw.sum() + 1.0e-12)
			this._pwz.set(0, k, dw.t)

			const dd = np.sum(1)
			dd.div(dd.sum() + 1.0e-12)
			this._pdz.set(0, k, dd)

			this._pz[k] = np.sum() / this._n.sum()
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._pdz.argmax(1).value
	}
}
