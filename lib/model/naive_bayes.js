import { Matrix } from '../util/math.js'

/**
 * Naive bayes
 */
class NaiveBayes {
	// https://qiita.com/fujin/items/bd58fc7a93dc6e001045
	constructor() {
		this._k = 0
		this._labels = []
		this._rate = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas
	 * @param {number[] | Array<Array<number>>} labels
	 */
	fit(datas, labels) {
		if (Array.isArray(labels[0])) {
			labels = labels.map(v => v[0])
		}
		this._labels = []
		this._init()
		if (datas.length === 0) return

		const sep_datas = []
		for (let i = 0; i < labels.length; i++) {
			const k = this._labels.indexOf(labels[i])
			if (k >= 0) {
				sep_datas[k].push(datas[i])
			} else {
				this._labels.push(labels[i])
				sep_datas.push([datas[i]])
			}
		}
		for (let k = 0; k < this._labels.length; k++) {
			const x = Matrix.fromArray(sep_datas[k])
			this._estimate_prob(x, k)
		}
		this._rate = sep_datas.map(v => v.length / datas.length)
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data
	 * @returns {number[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const ps = []
		for (let i = 0; i < this._labels.length; i++) {
			const p = this._data_prob(x, i)
			p.mult(this._rate[i])
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
 * Gaussian naive bayes
 */
export class GaussianNaiveBayes extends NaiveBayes {
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
