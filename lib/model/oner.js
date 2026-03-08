/**
 *  One Rule
 */
export default class OneR {
	// Very simple classification rules perform well on most commonly used datasets
	// https://rasbt.github.io/mlxtend/user_guide/classifier/OneRClassifier/
	// https://hacarus.github.io/interpretable-ml-book-ja/rules.html#%E5%8D%98%E4%B8%80%E3%81%AE%E7%89%B9%E5%BE%B4%E9%87%8F%E3%81%AB%E3%82%88%E3%82%8B%E8%A6%8F%E5%89%87%E5%AD%A6%E7%BF%92-oner
	/**
	 * Fit model.
	 * @param {Array<Array<*>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		const n = x.length
		const d = x[0].length
		let best_err = Infinity
		this._feature = -1
		this._choice = null
		for (let k = 0; k < d; k++) {
			const cnt = {}
			for (let i = 0; i < n; i++) {
				if (!cnt[x[i][k]]) {
					cnt[x[i][k]] = {}
				}
				if (!cnt[x[i][k]][y[i]]) {
					cnt[x[i][k]][y[i]] = 0
				}
				cnt[x[i][k]][y[i]]++
			}
			let err_cnt = 0
			const choice = {}
			for (const [v, c] of Object.entries(cnt)) {
				let cur_err_cnt = 0
				let max_cls = null
				let max_cnt = 0
				for (const [cls, m] of Object.entries(c)) {
					if (max_cnt < m) {
						cur_err_cnt += max_cnt
						max_cnt = m
						max_cls = cls
					}
				}
				err_cnt += cur_err_cnt
				choice[v] = max_cls
			}
			if (err_cnt < best_err) {
				best_err = err_cnt
				this._feature = k
				this._choice = choice
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<*>>} data Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(data) {
		return data.map(v => this._choice[v[this._feature]] ?? null)
	}
}
