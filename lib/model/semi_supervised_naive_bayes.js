/**
 * Semi-supervised naive bayes
 */
export default class SemiSupervisedNaiveBayes {
	// Text classification from labeled and unlabeled documents using EM.
	// https://www.ri.cmu.edu/pub_files/pub1/nigam_k_1999_1/nigam_k_1999_1.pdf
	// https://github.com/jmatayoshi/semi-supervised-naive-bayes
	/**
	 * @param {number} [lambda] Weight applied to the contribution of the unlabeled data
	 */
	constructor(lambda = 1) {
		this._lambda = lambda
		this._alpha = 2
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<string>>} datas Training data
	 * @param {(* | null)[]} labels Target values
	 */
	init(datas, labels) {
		const voc = new Set()
		this._labels = []
		for (let i = 0; i < datas.length; i++) {
			for (let j = 0; j < datas[i].length; j++) {
				voc.add(datas[i][j])
			}
		}
		this._vocabulary = [...voc]
		this._labeled_data = { w: [], i: [] }
		this._unlabeled_data = { w: [], i: [] }
		for (let i = 0; i < datas.length; i++) {
			const di = datas[i].map(w => this._vocabulary.indexOf(w))
			if (labels[i] !== null) {
				this._labeled_data.w.push(datas[i])
				this._labeled_data.i.push(di)
				this._labels.push(labels[i])
			} else {
				this._unlabeled_data.w.push(datas[i])
				this._unlabeled_data.i.push(di)
			}
		}
		this._classes = [...new Set(this._labels)]

		this._prob_wc = []
		this._prob_c = []
		for (let k = 0; k < this._classes.length; k++) {
			const pwc = Array(this._vocabulary.length).fill(0)
			let pc = 0
			for (let i = 0; i < this._labeled_data.i.length; i++) {
				if (this._labels[i] !== this._classes[k]) {
					continue
				}
				for (let j = 0; j < this._labeled_data.i[i].length; j++) {
					pwc[this._labeled_data.i[i][j]]++
				}
				pc++
			}
			const vock = pwc.reduce((s, v) => s + v, 0)
			this._prob_wc[k] = pwc.map(v => (1 + v) / (this._vocabulary.length + vock))
			this._prob_c[k] = (1 + pc) / (this._classes.length + datas.length)
		}
	}

	/**
	 * Fit model.
	 */
	fit() {
		const unlabeled_probs = this.probability(this._unlabeled_data.w)

		const prob_wc = []
		const prob_c = []
		for (let k = 0; k < this._classes.length; k++) {
			const pwc = Array(this._vocabulary.length).fill(0)
			let pc = 0
			for (let i = 0; i < this._labeled_data.i.length; i++) {
				if (this._labels[i] !== this._classes[k]) {
					continue
				}
				for (let j = 0; j < this._labeled_data.i[i].length; j++) {
					pwc[this._labeled_data.i[i][j]]++
				}
				pc++
			}
			for (let i = 0; i < this._unlabeled_data.i.length; i++) {
				for (let j = 0; j < this._unlabeled_data.i[i].length; j++) {
					pwc[this._unlabeled_data.i[i][j]] += this._lambda * unlabeled_probs[i][k]
				}
				pc += this._lambda * unlabeled_probs[i][k]
			}
			const vock = pwc.reduce((s, v) => s + v, 0)
			prob_wc[k] = pwc.map(v => (1 + v) / (this._vocabulary.length + vock))
			prob_c[k] =
				(1 + pc) /
				(this._classes.length + this._labeled_data.i.length + this._lambda * this._unlabeled_data.i.length)
		}
		this._prob_wc = prob_wc
		this._prob_c = prob_c
	}

	/**
	 * Returns predicted probabilities.
	 *
	 * @param {Array<Array<string>>} datas Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	probability(datas) {
		return datas.map(v => {
			const vocidx = v.map(w => this._vocabulary.indexOf(w))
			const p = Array(this._classes.length).fill(0)
			for (let k = 0; k < this._classes.length; k++) {
				p[k] = this._prob_c[k]
				for (let j = 0; j < v.length; j++) {
					p[k] *= this._prob_wc[k][vocidx[j]]
				}
			}
			const s = p.reduce((s, v) => s + v, 0)
			return p.map(v => v / s)
		})
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number} Log likelihood value
	 */
	logLikelihood() {
		const labeled_z = this.probability(this._labeled_data.w)
		const unlabeled_z = this.probability(this._unlabeled_data.w)
		let llh = 0
		for (let i = 0; i < this._classes.length; i++) {
			llh += (this._alpha - 1) * Math.log(this._prob_c[i])
			for (let j = 0; j < this._vocabulary.length; j++) {
				llh += (this._alpha - 1) * Math.log(this._prob_wc[i][j])
			}
		}
		for (let i = 0; i < this._labeled_data.i.length; i++) {
			for (let k = 0; k < this._classes.length; k++) {
				let v = Math.log(this._prob_c[k])
				for (let j = 0; j < this._labeled_data.i[i].length; j++) {
					v += Math.log(this._prob_wc[k][this._labeled_data.i[i][j]])
				}
				llh += labeled_z[i][k] * v
			}
		}
		for (let i = 0; i < this._unlabeled_data.i.length; i++) {
			for (let k = 0; k < this._classes.length; k++) {
				let v = Math.log(this._prob_c[k])
				for (let j = 0; j < this._unlabeled_data.i[i].length; j++) {
					v += Math.log(this._prob_wc[k][this._unlabeled_data.i[i][j]])
				}
				llh += this._lambda * unlabeled_z[i][k] * v
			}
		}
		return llh
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<string>>} datas Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(datas) {
		const prob = this.probability(datas)
		return prob.map(v => {
			let max_p = 0
			let max_c = -1
			for (let i = 0; i < this._classes.length; i++) {
				if (v[i] > max_p) {
					max_p = v[i]
					max_c = i
				}
			}
			return max_c < 0 ? null : this._classes[max_c]
		})
	}
}
