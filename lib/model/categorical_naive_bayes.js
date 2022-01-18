/**
 * Categorical naive bayes
 */
export default class CategoricalNaiveBayes {
	// https://scikit-learn.org/stable/modules/naive_bayes.html#categorical-naive-bayes
	/**
	 * @param {number} [alpha=1.0] Smoothing parameter
	 */
	constructor(alpha = 1.0) {
		this._alpha = alpha
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<*>>} datas
	 * @param {*[]} labels
	 */
	fit(datas, labels) {
		if (!this._cand) {
			this._d = datas[0].length
			this._cand = []
			for (let i = 0; i < this._d; i++) {
				this._cand[i] = [...new Set(datas.map(v => v[i]))]
			}
		}
		this._labels = [...new Set(labels)]

		this._prob = []
		for (let k = 0; k < this._labels.length; k++) {
			const pk = []
			for (let d = 0; d < this._d; d++) {
				pk[d] = Array(this._cand[d].length).fill(0)
				for (let i = 0; i < datas.length; i++) {
					if (labels[i] !== this._labels[k]) {
						continue
					}
					const idx = this._cand[d].indexOf(datas[i][d])
					pk[d][idx]++
				}
				const s = pk[d].reduce((s, v) => s + v, 0)
				pk[d] = pk[d].map(v => (v + this._alpha) / (s + this._alpha * pk[d].length))
			}
			this._prob[k] = pk
		}
	}

	/**
	 * Returns predicted probabilities.
	 *
	 * @param {Array<Array<*>>} datas
	 * @returns {Array<Array<number>>}
	 */
	probability(datas) {
		return datas.map(v => {
			const p = Array(this._labels.length).fill(1)
			for (let d = 0; d < this._d; d++) {
				const i = this._cand[d].indexOf(v[d])
				for (let k = 0; k < this._labels.length; k++) {
					p[k] *= this._prob[k][d][i]
				}
			}
			return p
		})
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<*>>} datas
	 * @returns {*[]}
	 */
	predict(datas) {
		const prob = this.probability(datas)
		return prob.map(v => {
			let max_p = 0
			let max_c = -1
			for (let i = 0; i < this._labels.length; i++) {
				if (v[i] > max_p) {
					max_p = v[i]
					max_c = i
				}
			}
			return max_c < 0 ? null : this._labels[max_c]
		})
	}
}
