/**
 *  Zero Rule
 */
export default class ZeroR {
	// https://www.researchgate.net/publication/385851312_An_exploratory_research_and_useful_information_on_enhancing_the_effectiveness_of_Zero-R_and_One-R_algorithms_in_data_classification_methods
	/**
	 * Fit model.
	 * @param {Array<Array<*>>} x Training data
	 * @param {*[]} y Target values
	 */
	// biome-ignore lint/correctness/noUnusedFunctionParameters: interface consistency
	fit(x, y) {
		const c = {}
		for (let i = 0; i < y.length; i++) {
			if (!c[y[i]]) {
				c[y[i]] = 0
			}
			c[y[i]] += 1
		}
		this._p = null
		let best_cnt = -1
		for (const k of Object.keys(c)) {
			if (best_cnt < c[k]) {
				best_cnt = c[k]
				this._p = k
			}
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<*>>} data Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(data) {
		return Array(data.length).fill(this._p)
	}
}
