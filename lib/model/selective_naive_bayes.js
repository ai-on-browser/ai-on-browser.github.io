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
 * Selective Naive bayes
 */
export default class SelectiveNaiveBayes {
	// https://yukinoi.hatenablog.com/entry/2017/12/23/004019
	/**
	 * @param {'gaussian'} [distribution] Distribution name
	 */
	constructor(distribution = 'gaussian') {
		this._labels = []
		this._rate = []
		this._ratec = []

		if (distribution === 'gaussian') {
			this._p_class = Gaussian
		}
		this._p = []
		this._pc = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Training data
	 * @param {*[]} labels Target values
	 */
	fit(datas, labels) {
		this._labels = [...new Set(labels)]
		this._p = []
		this._pc = []

		this._rate = []
		this._ratec = []
		for (let k = 0; k < this._labels.length; k++) {
			const x = Matrix.fromArray(datas.filter((_, i) => labels[i] === this._labels[k]))
			const xc = Matrix.fromArray(datas.filter((_, i) => labels[i] !== this._labels[k]))
			this._p[k] = new this._p_class()
			this._p[k]._estimate_prob(x)
			this._pc[k] = new this._p_class()
			this._pc[k]._estimate_prob(xc)
			this._rate[k] = x.rows / datas.length
			this._ratec[k] = xc.rows / datas.length
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(data) {
		const ps = []

		const pSum = Array(data.length).fill(0)
		const pcSum = Array(data.length).fill(0)
		for (let i = 0; i < this._labels.length; i++) {
			const p = this._p[i]._data_prob(data).map(v => v * this._rate[i])
			const pc = this._pc[i]._data_prob(data).map(v => v * this._ratec[i])
			if (this._rate[i] >= 0.5) {
				ps.push(p)
			} else {
				ps.push(pc)
			}
			for (let j = 0; j < data.length; j++) {
				pSum[j] += p[j]
				pcSum[j] += pc[j]
			}
		}
		for (let i = 0; i < this._labels.length; i++) {
			if (this._rate[i] >= 0.5) {
				ps[i] = ps[i].map((v, j) => v / pSum[j])
			} else {
				ps[i] = ps[i].map((v, j) => 1 - ((this._labels.length - 1) * v) / pcSum[j])
			}
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
