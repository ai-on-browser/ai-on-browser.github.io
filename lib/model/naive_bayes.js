import Matrix from '../util/matrix.js'

class Gaussian {
	constructor() {
		this._means = null
		this._vars = null
	}

	_estimate_prob(x) {
		this._means = x.mean(0).value
		this._vars = x.variance(0).value
	}

	_data_prob(x) {
		return x.map(xi =>
			xi.reduce((s, v, d) => {
				const vari = this._vars[d]
				return (s * Math.exp(-((v - this._means[d]) ** 2) / (vari * 2))) / Math.sqrt(2 * Math.PI * vari)
			}, 1)
		)
	}
}

class Multinomial {
	constructor({ a = 1 } = {}) {
		this._alpha = a
	}

	_estimate_prob(x) {
		this._t = []
		const n = x.rows
		const d = x.cols
		for (let j = 0; j < d; j++) {
			this._t[j] = {}
			for (let i = 0; i < n; i++) {
				const v = x.at(i, j)
				if (!this._t[j][v]) {
					this._t[j][v] = 0
				}
				this._t[j][v]++
			}
			const keys = Object.keys(this._t[j])
			const den = n + this._alpha * keys.length
			for (const k of keys) {
				this._t[j][k] = (this._t[j][k] + this._alpha) / den
			}
		}
	}

	_data_prob(x) {
		return x.map(xi => xi.reduce((s, v, d) => s * (this._t[d][v] ?? 0), 1))
	}
}

/**
 * Naive bayes
 */
export default class NaiveBayes {
	// https://qiita.com/fujin/items/bd58fc7a93dc6e001045
	/**
	 * @param {'gaussian' | 'multinomial' | { name: 'gaussian' } | { name: 'multinomial', a?: number }} [distribution] Distribution name
	 */
	constructor(distribution = 'gaussian') {
		this._labels = []
		this._rate = []

		if (typeof distribution === 'string') {
			distribution = { name: distribution }
		}
		if (distribution.name === 'gaussian') {
			this._p_class = Gaussian
		} else if (distribution.name === 'multinomial') {
			this._p_class = Multinomial
		}
		this._p_options = distribution
		this._p = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Training data
	 * @param {*[]} labels Target values
	 */
	fit(datas, labels) {
		this._labels = [...new Set(labels)]
		this._p = []

		this._rate = []
		for (let k = 0; k < this._labels.length; k++) {
			const x = Matrix.fromArray(datas.filter((_, i) => labels[i] === this._labels[k]))
			this._p[k] = new this._p_class(this._p_options)
			this._p[k]._estimate_prob(x)
			this._rate[k] = x.rows / datas.length
		}
	}

	/**
	 * Returns predicted probabilities.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	probability(data) {
		const ps = []
		for (let i = 0; i < data.length; i++) {
			ps[i] = []
		}
		for (let i = 0; i < this._labels.length; i++) {
			const p = this._p[i]._data_prob(data)
			for (let k = 0; k < data.length; k++) {
				ps[k][i] = p[k] * this._rate[i]
			}
		}
		return ps
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(data) {
		const ps = []
		for (let i = 0; i < this._labels.length; i++) {
			const p = this._p[i]._data_prob(data)
			ps.push(p.map(v => v * this._rate[i]))
		}
		return data.map((_, n) => {
			let max_p = 0
			let max_c = -1
			for (let i = 0; i < this._labels.length; i++) {
				const v = ps[i][n]
				if (v > max_p) {
					max_p = v
					max_c = i
				}
			}
			return this._labels[max_c]
		})
	}
}
