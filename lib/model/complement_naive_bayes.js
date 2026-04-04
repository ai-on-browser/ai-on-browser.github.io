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

/**
 * Complement Naive Bayes
 */
export default class ComplementNaiveBayes {
	// http://ibisforest.org/index.php?complement%20naive%20Bayes
	/**
	 * @param {'gaussian'} [distribution] Distribution name
	 */
	constructor(distribution = 'gaussian') {
		this._labels = []
		this._rate = []

		if (distribution === 'gaussian') {
			this._p_class = Gaussian
		}
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
			const x = Matrix.fromArray(datas.filter((_, i) => labels[i] !== this._labels[k]))
			this._p[k] = new this._p_class()
			this._p[k]._estimate_prob(x)
			this._rate[k] = 1 - x.rows / datas.length
		}
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
			ps.push(p.map(v => this._rate[i] / v))
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
