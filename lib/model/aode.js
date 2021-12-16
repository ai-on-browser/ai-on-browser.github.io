import { Matrix } from '../util/math.js'

class Gaussian {
	constructor() {
		this._means = null
		this._vars = null
	}

	_estimate_prob(x) {
		this._means = x.mean(0)
		this._vars = x.variance(0)
	}

	_data_prob(x) {
		const xs = x.copySub(this._means)
		xs.mult(xs)
		xs.div(this._vars)
		xs.map(v => Math.exp(-v / 2))
		xs.div(this._vars.copyMap(v => Math.sqrt(2 * Math.PI * v)))
		return xs.prod(1)
	}
}

class ODE {
	constructor(discrete = 20, distribution = 'gaussian') {
		this._discrete = discrete
		this._m = 1

		this._p_class = Gaussian
		this._p = []
	}

	fit(datas, y, k) {
		this._k = k
		if (Array.isArray(y[0])) {
			y = y.map(v => v[0])
		}
		this._labels = [...new Set(y)]
		this._p = []

		const x = Matrix.fromArray(datas)
		const xk = x.col(k)
		const xkmax = xk.max()
		const xkmin = xk.min()
		this._r = [-Infinity]
		for (let t = 1; t < this._discrete; t++) {
			this._r[t] = xkmin + ((xkmax - xkmin) * t) / this._discrete
		}
		this._r.push(Infinity)

		this._rate = []
		for (let n = 0; n < this._labels.length; n++) {
			this._rate[n] = []
			this._p[n] = []
			for (let t = 0; t < this._discrete; t++) {
				const data = datas.filter(
					(d, i) => y[i] === this._labels[n] && this._r[t] <= d[k] && d[k] < this._r[t + 1]
				)
				if (data.length >= this._m) {
					this._p[n][t] = new this._p_class()
					this._p[n][t]._estimate_prob(Matrix.fromArray(data), n, t)
					this._rate[n][t] = data.length / datas.length
				} else {
					this._rate[n][t] = 0
				}
			}
		}
	}

	probability(data) {
		const ps = []
		for (let i = 0; i < this._labels.length; i++) {
			const p = data.map(d => {
				const xd = new Matrix(1, d.length, d)
				for (let t = 0; t < this._discrete; t++) {
					if (this._r[t] <= d[this._k] && d[this._k] < this._r[t + 1]) {
						if (this._rate[i][t] === 0) {
							return 0
						}
						return this._p[i][t]._data_prob(xd, i, t).toScaler() * this._rate[i][t]
					}
				}
			})
			ps.push(p)
		}
		return ps
	}

	predict(data) {
		const ps = this.probability(data)
		return data.map((v, n) => {
			let max_p = 0
			let max_c = -1
			for (let i = 0; i < this._labels.length; i++) {
				let v = ps[i][n]
				if (v > max_p) {
					max_p = v
					max_c = i
				}
			}
			return this._labels[max_c]
		})
	}
}

/**
 * Averaged One-Dependence Estimators
 */
export default class AODE {
	// https://github.com/saitejar/AnDE
	// https://en.wikipedia.org/wiki/Averaged_one-dependence_estimators
	// https://www.programmersought.com/article/47484148792/
	/**
	 * @param {number} discrete
	 */
	constructor(discrete = 20) {
		this._discrete = discrete
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas
	 * @param {number[] | Array<Array<number>>} y
	 */
	fit(datas, y) {
		const m = datas[0].length
		if (Array.isArray(y[0])) {
			y = y.map(v => v[0])
		}
		this._labels = [...new Set(y)]

		this._ode = []
		for (let i = 0; i < m; i++) {
			const ode = new ODE(this._discrete)
			ode.fit(datas, y, i)
			this._ode[i] = ode
		}
	}

	/**
	 * Returns predicted datas.
	 * @param {Array<Array<number>>} data
	 * @returns {(number | null)[]}
	 */
	predict(data) {
		const probs = this._ode.map(ode => ode.probability(data))
		const p = []
		for (let i = 0; i < data.length; i++) {
			let max_p = -Infinity
			let max_c = -1
			for (let k = 0; k < this._labels.length; k++) {
				const v = probs.reduce((s, v) => s + v[k][i], 0) / this._ode.length
				if (v > max_p) {
					max_p = v
					max_c = k
				}
			}
			p[i] = max_p > 0 ? this._labels[max_c] : null
		}
		return p
	}
}
