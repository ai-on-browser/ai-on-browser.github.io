import Matrix from '../util/matrix.js'

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
		const xs = Matrix.sub(x, this._means)
		xs.mult(xs)
		xs.div(this._vars)
		xs.map(v => Math.exp(-v / 2))
		xs.div(Matrix.map(this._vars, v => Math.sqrt(2 * Math.PI * v)))
		return xs.prod(1)
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
			const x = Matrix.fromArray(datas.filter((v, i) => labels[i] === this._labels[k]))
			const xc = Matrix.fromArray(datas.filter((v, i) => labels[i] !== this._labels[k]))
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
		const x = Matrix.fromArray(data)
		const ps = []

		const pSum = Matrix.zeros(x.rows, 1)
		const pcSum = Matrix.zeros(x.rows, 1)
		for (let i = 0; i < this._labels.length; i++) {
			const p = this._p[i]._data_prob(x)
			p.mult(this._rate[i])
			const pc = this._pc[i]._data_prob(x)
			pc.mult(this._ratec[i])
			if (this._rate[i] >= 0.5) {
				ps.push(p)
			} else {
				ps.push(pc)
			}
			pSum.add(p)
			pcSum.add(pc)
		}
		for (let i = 0; i < this._labels.length; i++) {
			if (this._rate[i] >= 0.5) {
				ps[i].div(pSum)
			} else {
				ps[i].div(pcSum)
				ps[i].map(v => 1 - (this._labels.length - 1) * v)
			}
		}
		return data.map((v, n) => {
			let max_p = 0
			let max_c = -1
			for (let i = 0; i < this._labels.length; i++) {
				const v = ps[i].value[n]
				if (v > max_p) {
					max_p = v
					max_c = i
				}
			}
			return this._labels[max_c]
		})
	}
}
