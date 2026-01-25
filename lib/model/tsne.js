import Matrix from '../util/matrix.js'

const normal_random = (m = 0, s = 1) => {
	const std = Math.sqrt(s)
	const x = Math.random()
	const y = Math.random()
	const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y)
	const Y = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y)
	return [X * std + m, Y * std + m]
}

/**
 * Stochastic Neighbor Embedding
 */
export class SNE {
	// https://qiita.com/g-k/items/120f1cf85ff2ceae4aba
	/**
	 * @param {number} [rd] Reduced dimension
	 * @param {number} [perplexity] Perplexity
	 */
	constructor(rd = 1, perplexity = 30) {
		this._epoch = 0
		this._rd = rd
		this._learning_rate = 0.1
		this._perplexity = perplexity
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 */
	init(x) {
		this._x = x
		this._y = []
		for (let i = 0; i < x.length; i++) {
			this._y[i] = []
			for (let k = 0; k < this._rd; k++) {
				this._y[i][k] = normal_random(0, 1.0e-4)[0]
			}
		}
	}

	_pj_i(x) {
		const n = x.length
		const pj_i = []
		const norms = []
		let maxnorm = 1.0
		for (let i = 0; i < n; i++) {
			norms[i] = []
			norms[i][i] = 0
			for (let j = 0; j < i; j++) {
				norms[i][j] = norms[j][i] = x[i].reduce((a, v, k) => a + (v - x[j][k]) ** 2, 0)
				if (norms[i][j] > maxnorm) {
					maxnorm = norms[i][j]
				}
			}
		}
		for (let i = 0; i < n; i++) {
			let sigma = maxnorm
			let lowsigma = 0,
				highsigma = null
			const tol = 1.0e-8
			const pi = Array(n).fill(0)
			while (1) {
				let s = 0
				const sgm = 2 * sigma ** 2
				pi[i] = 0
				for (let j = 0; j < n; j++) {
					if (i === j) continue
					s += pi[j] = Math.exp(-norms[i][j] / sgm)
				}
				let entropy = 0
				for (let j = 0; j < n; j++) {
					pi[j] /= s
					if (pi[j] > tol) {
						entropy -= pi[j] * Math.log2(pi[j])
					}
				}
				if (!isFinite(sigma)) {
					break
				}
				const perp = 2 ** entropy
				if (Math.abs(perp - this._perplexity) < tol) {
					break
				} else if (perp < this._perplexity) {
					lowsigma = sigma
					sigma = highsigma === null ? sigma * 2 : (sigma + highsigma) / 2
				} else {
					highsigma = sigma
					sigma = (sigma + lowsigma) / 2
				}
			}
			pj_i.push(pi)
		}
		return pj_i
	}

	/**
	 * Fit model and returns reduced values.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	fit() {
		const x = this._x
		const y = this._y
		const n = x.length
		const pj_i = this._pj_i(x)

		const q = []
		for (let i = 0; i < n; i++) {
			let s = 0
			q[i] = Array(n).fill(0)
			for (let j = 0; j < n; j++) {
				if (i === j) continue
				const v = Math.exp(-y[i].reduce((a, v, k) => a + (v - y[j][k]) ** 2, 0))
				q[i][j] = v
				s += v
			}
			if (s > 0) {
				q[i] = q[i].map(r => r / s)
			}
		}

		const d = this._rd
		const dy = []
		for (let i = 0; i < n; i++) {
			dy[i] = Array(d).fill(0)
			for (let j = 0; j < n; j++) {
				if (j === i) continue
				const c = pj_i[i][j] - q[i][j] + pj_i[j][i] - q[j][i]
				for (let k = 0; k < d; k++) {
					dy[i][k] += c * (y[i][k] - y[j][k])
				}
			}
		}
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < d; k++) {
				y[i][k] -= dy[i][k] * 2 * this._learning_rate
			}
		}
		this._epoch += 1

		return new Matrix(n, d, this._y).toArray()
	}

	/**
	 * Returns reduced values.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict() {
		return Matrix.fromArray(this._y).toArray()
	}
}

/**
 * T-distributed Stochastic Neighbor Embedding
 */
export class tSNE {
	// https://www.slideshare.net/TakayukiYagi1/tsne
	// https://blog.albert2005.co.jp/2015/12/02/tsne/
	// https://lvdmaaten.github.io/publications/papers/JMLR_2008.pdf
	/**
	 * @param {Array<Array<number>>} datas Training data
	 * @param {number} [rd] Reduced dimension
	 * @param {number} [perplexity] Perplexity
	 */
	constructor(rd = 1, perplexity = 30) {
		this._epoch = 0
		this._rd = rd
		this._learning_rate = 200
		this._perplexity = perplexity
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 */
	init(x) {
		this._x = x
		this._y = []
		for (let i = 0; i < x.length; i++) {
			this._y[i] = []
			for (let k = 0; k < this._rd; k++) {
				this._y[i][k] = normal_random(0, 1.0e-4)[0]
			}
		}
	}

	_pj_i(x) {
		const n = x.length
		const pj_i = []
		const norms = []
		let maxnorm = 1.0
		for (let i = 0; i < n; i++) {
			norms[i] = []
			norms[i][i] = 0
			for (let j = 0; j < i; j++) {
				norms[i][j] = norms[j][i] = x[i].reduce((a, v, k) => a + (v - x[j][k]) ** 2, 0)
				if (norms[i][j] > maxnorm) {
					maxnorm = norms[i][j]
				}
			}
		}
		for (let i = 0; i < n; i++) {
			let sigma = maxnorm
			let lowsigma = 0,
				highsigma = null
			const tol = 1.0e-8
			const pi = Array(n).fill(0)
			while (1) {
				let s = 0
				const sgm = 2 * sigma ** 2
				pi[i] = 0
				for (let j = 0; j < n; j++) {
					if (i === j) continue
					s += pi[j] = Math.exp(-norms[i][j] / sgm)
				}
				let entropy = 0
				for (let j = 0; j < n; j++) {
					pi[j] /= s
					if (pi[j] > tol) {
						entropy -= pi[j] * Math.log2(pi[j])
					}
				}
				if (!isFinite(sigma)) {
					break
				}
				const perp = 2 ** entropy
				if (Math.abs(perp - this._perplexity) < tol) {
					break
				} else if (perp < this._perplexity) {
					lowsigma = sigma
					sigma = highsigma === null ? sigma * 2 : (sigma + highsigma) / 2
				} else {
					highsigma = sigma
					sigma = (sigma + lowsigma) / 2
				}
			}
			pj_i.push(pi)
		}
		return pj_i
	}

	/**
	 * Fit model and returns reduced values.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	fit() {
		const x = this._x
		const y = this._y
		const n = x.length
		const pj_i = this._pj_i(x)

		const p = []
		for (let i = 0; i < n; i++) {
			p[i] = []
			for (let j = 0; j <= i; j++) {
				p[i][j] = p[j][i] = (pj_i[i][j] + pj_i[j][i]) / (2 * n)
			}
		}

		const qtmp = []
		let qden = 0
		for (let i = 0; i < n; i++) {
			qtmp[i] = []
			for (let j = 0; j <= i; j++) {
				const v = 1 / (1 + y[i].reduce((a, v, k) => a + (v - y[j][k]) ** 2, 0))
				qtmp[i][j] = qtmp[j][i] = v
				if (i !== j) qden += v * 2
			}
		}
		const q = qtmp.map(r => r.map(v => v / qden))

		const d = this._rd
		const dy = []
		for (let i = 0; i < n; i++) {
			dy[i] = Array(d).fill(0)
			for (let j = 0; j < n; j++) {
				if (j === i) continue
				const c = (p[i][j] - q[i][j]) * qtmp[i][j]
				for (let k = 0; k < d; k++) {
					dy[i][k] += c * (y[i][k] - y[j][k])
				}
			}
		}
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < d; k++) {
				y[i][k] -= dy[i][k] * 4 * this._learning_rate
			}
		}
		this._epoch += 1

		return new Matrix(n, d, this._y).toArray()
	}

	/**
	 * Returns reduced values.
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict() {
		return Matrix.fromArray(this._y).toArray()
	}
}
