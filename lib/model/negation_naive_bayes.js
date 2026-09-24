class Gaussian {
	constructor() {
		this._means = null
		this._vars = null
	}

	_estimate_prob(x) {
		const n = x.length
		this._means = []
		this._vars = []
		for (let j = 0; j < x[0].length; j++) {
			let v = 0
			let v2 = 0
			for (let i = 0; i < n; i++) {
				v += x[i][j]
				v2 += x[i][j] ** 2
			}
			this._means[j] = v / n
			this._vars[j] = v2 / n - (v / n) ** 2
		}
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
 * Negation Naive bayes
 */
export default class NegationNaiveBayes {
	// https://yukinoi.hatenablog.com/entry/2016/06/07/121759
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
			const x = datas.filter((_, i) => labels[i] !== this._labels[k])
			this._p[k] = new this._p_class()
			this._p[k]._estimate_prob(x)
			this._rate[k] = 1 - x.length / datas.length
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
			ps.push(p.map(v => 1 / (1 - this._rate[i]) / v))
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
