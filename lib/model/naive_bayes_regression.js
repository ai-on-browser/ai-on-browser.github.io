/**
 * Naive bayes regression
 */
export default class NaiveBayesRegression {
	// E. Frank, L. Trigg, G. Holmes, I. H. Witten, Technical Note Naive Bayes for Regression (1999)
	// https://www.cs.waikato.ac.nz/~eibe/pubs/nbr.pdf
	/**
	 * @param {boolean[]} categoryPositions Category column position
	 */
	constructor(categoryPositions) {
		this._iscat = categoryPositions
		this._categories = []
		this._hx = []
		this._hy = []
		this._hk = []

		this._c_cand = [0.4, 0.5, 0.6, 0.7, 0.8]
		this._d = 50
		this._h = null
	}

	_gaussian(x) {
		return Math.exp(-(x ** 2) / 2) / Math.sqrt(2 * Math.PI)
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<*>>} x Training data
	 * @param {Array<number>} y Target values
	 */
	fit(x, y) {
		this._x = x
		this._y = y

		const n = x.length
		for (let k = 0; k < this._iscat.length; k++) {
			const xk = x.map(v => v[k])
			if (this._iscat[k]) {
				this._categories[k] = {}
				for (let j = 0; j < n; j++) {
					if (!this._categories[k][xk[j]]) {
						this._categories[k][xk[j]] = 0
					}
					this._categories[k][xk[j]]++
				}
				this._hk[k] = {}
				for (const vk of Object.keys(this._categories[k])) {
					let min_cv = Infinity
					this._hk[k][vk] = 1
					for (const ck of this._c_cand) {
						const hk = ck / Math.sqrt(this._categories[k][vk])
						let cv = 0
						for (let i = 0; i < n; i++) {
							if (xk[i] !== vk) continue
							let v = 0
							for (let j = 0; j < n; j++) {
								if (i === j || xk[j] !== vk) continue
								v += this._gaussian((y[j] - y[i]) / hk)
							}
							cv += Math.log(v / ((n - 1) * hk))
						}
						if (-cv / n < min_cv) {
							min_cv = -cv / n
							this._hk[k][vk] = hk
						}
					}
				}
			} else {
				let min_cv = Infinity
				this._hx[k] = 0
				this._hy[k] = 0
				for (const cx of this._c_cand) {
					const hx = cx / Math.sqrt(n)
					for (const cy of this._c_cand) {
						const hy = cy / Math.sqrt(n)
						let cv = 0
						for (let i = 0; i < n; i++) {
							let v = 0
							for (let j = 0; j < n; j++) {
								if (i === j) continue
								v += this._gaussian((xk[j] - xk[i]) / hx) * this._gaussian((y[j] - y[i]) / hy)
							}
							cv += Math.log(v / ((n - 1) * hx * hy))
						}
						if (-cv / n < min_cv) {
							min_cv = -cv / n
							this._hx[k] = hx
							this._hy[k] = hy
						}
					}
				}
			}
		}

		this._ymax = -Infinity
		this._ymin = Infinity
		for (let i = 0; i < n; i++) {
			this._ymax = Math.max(this._ymax, y[i])
			this._ymin = Math.min(this._ymin, y[i])
		}
		this._h = (this._ymax - this._ymin) / (this._d - 1)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<*>>} x Sample data
	 * @returns {Array<number>} Predicted values
	 */
	predict(x) {
		const pred = []
		const n = this._x.length
		for (let i = 0; i < x.length; i++) {
			const pi = []
			const g = []
			for (let t = -Math.floor(this._d / 2); t <= Math.ceil(this._d * 1.5); t++) {
				const y = this._ymin + this._h * t
				let p = 1
				for (let k = 0; k < this._iscat.length; k++) {
					if (this._iscat[k]) {
						let pt = 0
						for (let j = 0; j < n; j++) {
							if (x[i][k] !== this._x[j][k]) continue
							pt += this._gaussian((y - this._y[j]) / this._hk[k][x[i][k]])
						}
						p *= pt / (n * this._hk[k][x[i][k]])
					} else {
						let pt = 0
						for (let j = 0; j < n; j++) {
							pt +=
								this._gaussian((x[i][k] - this._x[j][k]) / this._hx[k]) *
								this._gaussian((y - this._y[j]) / this._hy[k])
						}
						p *= pt / (n * this._hx[k] * this._hy[k])
					}
				}
				pi.push(p)
				g.push(y)
			}
			const s = pi.reduce((s, v) => s + v, 0)
			pred[i] = pi.reduce((s, v, k) => s + v * g[k], 0) / s
		}
		return pred
	}
}
