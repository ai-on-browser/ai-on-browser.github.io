import { Matrix } from '../util/math.js'

/**
 * Conditional random fields
 */
export default class CRF {
	// https://qiita.com/research-PORT-INC/items/518b960e6d0d0475e1df
	// https://www.slideshare.net/rezoolab/seminar-19715143
	// https://data-analytics.fun/2020/12/02/conditional-random-fields/
	// https://www.ism.ac.jp/editsec/toukei/pdf/64-2-179.pdf
	constructor() {
		this._xn = 0
		this._yn = 0
		this._w = null
		this._e = 0.1

		this._x_cand = []
		this._y_cand = []

		this._phi = (x, y1, y0) => {
			x = this._x_cand.indexOf(x)
			y1 = y1 === undefined ? this._yn - 1 : this._y_cand.indexOf(y1)
			y0 = y0 === undefined ? this._yn - 1 : this._y_cand.indexOf(y0)

			const pxyy = Array(this._xn * this._yn * this._yn).fill(0)
			if (x >= 0 && y1 >= 0 && y0 >= 0) {
				pxyy[x * this._yn * this._yn + y1 * this._yn + y0] = 1
			}
			const pxy = Array(this._xn * this._yn).fill(0)
			if (x >= 0 && y1 >= 0) {
				pxy[x * this._yn + y1] = 1
			}
			const pyy = Array(this._yn * this._yn).fill(0)
			if (y1 >= 0 && y0 >= 0) {
				pyy[y1 * this._yn + y0] = 1
			}
			return [].concat(pyy, pxy, pxyy)
		}
	}

	_psi(x, y1, y0) {
		const phi = this._phi(x, y1, y0)
		let v = 0
		for (let i = 0; i < phi.length; i++) {
			v += this._w[i] * phi[i]
		}
		return Math.exp(v)
	}

	_alpha(x, scaled = false) {
		const alphas = [Array(this._yn).fill(1)]
		const c = scaled && [1]
		for (let k = 0; k < x.length; k++) {
			const ak = []
			for (let i = 0; i < this._yn; i++) {
				ak[i] = 0
				for (let j = 0; j < this._yn; j++) {
					ak[i] += alphas[k][j] * this._psi(x[k], this._y_cand[i], this._y_cand[j])
				}
			}
			alphas[k + 1] = ak
			if (c) {
				c[k] = ak.reduce((s, v) => s + v, 0)
				alphas[k + 1] = ak.map(v => v / c[k])
			}
		}
		if (scaled) {
			return [alphas, c]
		}
		return alphas
	}

	_beta(x, scaled = false) {
		const betas = []
		betas[x.length] = Array(this._yn).fill(1)
		const c = scaled && []
		if (scaled) {
			c[x.length] = 1
		}
		for (let k = x.length - 1; k >= 0; k--) {
			const bk = []
			for (let i = 0; i < this._yn; i++) {
				bk[i] = 0
				for (let j = 0; j < this._yn; j++) {
					bk[i] += betas[k + 1][j] * this._psi(x[k], this._y_cand[j], this._y_cand[i])
				}
			}
			betas[k] = bk
			if (c) {
				c[k] = bk.reduce((s, v) => s + v, 0)
				betas[k] = bk.map(v => v / c[k])
			}
		}
		if (scaled) {
			return [betas, c]
		}
		return betas
	}

	_z(x) {
		const alpha = this._alpha(x)
		const an = alpha[alpha.length - 1]
		return an.reduce((s, v) => s + v, 0)
	}

	_p(x, scaled = false) {
		let alpha, ca
		if (scaled) {
			;[alpha, ca] = this._alpha(x, true)
		} else {
			alpha = this._alpha(x)
		}
		let beta, cb
		if (scaled) {
			;[beta, cb] = this._beta(x, true)
		} else {
			beta = this._beta(x)
		}
		let z
		if (!scaled) {
			z = 1 / this._z(x)
		} else {
			z = 1
		}

		const p = []
		for (let t = x.length - 1; t >= 0; t--) {
			p[t] = []
			if (scaled) {
				z *= cb[t] / ca[t]
			}
			for (let i = 0; i < this._yn; i++) {
				p[t][i] = []
				for (let j = 0; j < this._yn; j++) {
					p[t][i][j] = this._psi(x[t], this._y_cand[i], this._y_cand[j]) * alpha[t][j] * beta[t][i] * z
				}
			}
		}
		return p
	}

	/**
	 * Fit model.
	 * @param {Array<Array<*>>} x
	 * @param {Array<Array<*>>} y
	 */
	fit(x, y) {
		if (!this._w) {
			const x_cand = new Set()
			const y_cand = new Set()
			for (let i = 0; i < x.length; i++) {
				for (let k = 0; k < x[i].length; k++) {
					x_cand.add(x[i][k])
					y_cand.add(y[i][k])
				}
			}
			this._x_cand = [...x_cand]
			this._y_cand = [...y_cand]
			this._xn = this._x_cand.length
			this._yn = this._y_cand.length + 1

			const testvec = this._phi(x[0][1], y[0][1], y[0][0])
			this._w = Matrix.randn(testvec.length, 1).value
		}

		const d = this._w.length
		const dw = Array(d).fill(0)
		for (let s = 0; s < x.length; s++) {
			const p = this._p(x[s], true)
			for (let t = 0; t < x[s].length; t++) {
				const phi = this._phi(x[s][t], y[s][t], y[s][t - 1])
				for (let i = 0; i < this._yn; i++) {
					for (let j = 0; j < this._yn; j++) {
						const phi_ = this._phi(x[s][t], this._y_cand[i], this._y_cand[j])
						for (let k = 0; k < d; k++) {
							phi[k] -= p[t][i][j] * phi_[k]
						}
					}
				}

				for (let k = 0; k < d; k++) {
					dw[k] += phi[k]
				}
			}
		}

		for (let k = 0; k < d; k++) {
			this._w[k] += (this._e * dw[k]) / x.length
		}
	}

	/**
	 * Returns probability P(y|x).
	 * @param {*[]} x
	 * @param {*[]} y
	 */
	probability(x, y) {
		const z = this._z(x)
		const p = this._phi(x[0], y[0], undefined)
		for (let i = 1; i < x.length; i++) {
			const pi = this._phi(x[i], y[i], y[i - 1])
			for (let k = 0; k < pi.length; k++) {
				p[k] += pi[k]
			}
		}
		return Math.exp(p.reduce((s, v, d) => s + v * this._w[d], 0)) / z
	}

	/**
	 * Returns predicted labels.
	 * @param {Array<Array<*>>} x
	 * @returns {Array<Array<*>>}
	 */
	predict(x) {
		const p = []
		for (let k = 0; k < x.length; k++) {
			const f = [Array(this._yn).fill(0)]
			const g = []
			for (let t = 0; t < x[k].length; t++) {
				f[t + 1] = []
				g[t] = []
				for (let i = 0; i < this._yn; i++) {
					f[t + 1][i] = -Infinity
					g[t][i] = null
					for (let j = 0; j < this._yn; j++) {
						const phi = this._phi(x[k][t], this._y_cand[i], this._y_cand[j])
						const v = f[t][j] + phi.reduce((s, v, d) => s + v * this._w[d], 0)
						if (f[t + 1][i] < v) {
							f[t + 1][i] = v
							g[t][i] = j
						}
					}
				}
			}
			p[k] = []
			let mv = -Infinity
			for (let i = 0; i < this._yn; i++) {
				if (mv < f[x[k].length][i]) {
					mv = f[x[k].length][i]
					p[k][x[k].length - 1] = i
				}
			}
			for (let t = x[k].length - 2; t >= 0; t--) {
				p[k][t] = g[t + 1][p[k][t + 1]]
			}
			p[k] = p[k].map(v => this._y_cand[v])
		}
		return p
	}
}
