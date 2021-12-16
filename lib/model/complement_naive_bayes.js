import { Matrix } from '../util/math.js'

/**
 * Complement Naive Bayes
 */
class ComplementNaiveBayes {
	// http://ibisforest.org/index.php?complement%20naive%20Bayes
	constructor() {
		this._k = 0
		this._labels = []
		this._rate = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas
	 * @param {*[]} labels
	 */
	fit(datas, labels) {
		this._labels = [...new Set(labels)]
		this._init()

		this._rate = []
		for (let k = 0; k < this._labels.length; k++) {
			const x = Matrix.fromArray(datas.filter((v, i) => labels[i] !== this._labels[k]))
			this._estimate_prob(x, k)
			this._rate[k] = 1 - x.rows / datas.length
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data
	 * @returns {*[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const ps = []
		for (let i = 0; i < this._labels.length; i++) {
			const p = this._data_prob(x, i)
			p.idiv(this._rate[i])
			ps.push(p)
		}
		return data.map((v, n) => {
			let max_p = 0
			let max_c = -1
			for (let i = 0; i < this._labels.length; i++) {
				let v = ps[i].value[n]
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
 * Gaussian Complement Naive Bayes
 */
export class GaussianComplementNaiveBayes extends ComplementNaiveBayes {
	constructor() {
		super()
		this._means = []
		this._vars = []
	}

	_init() {
		this._means = []
		this._vars = []
	}

	_estimate_prob(x, cls) {
		this._means[cls] = x.mean(0)
		this._vars[cls] = x.variance(0)
	}

	_data_prob(x, cls) {
		const m = this._means[cls]
		const s = this._vars[cls]
		const xs = x.copySub(m)
		xs.mult(xs)
		xs.div(s)
		xs.map(v => Math.exp(-v / 2))
		xs.div(s.copyMap(v => Math.sqrt(2 * Math.PI * v)))
		return xs.prod(1)
	}
}
