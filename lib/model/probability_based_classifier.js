/**
 * @typedef {object} ProbabilityModel
 * @property {function(Array<Array<number>>): void} fit Fit model
 * @property {function(Array<Array<number>>): number[]} probability Returns predicted values
 */
/**
 * Probability based classifier
 */
export default class ProbabilityBasedClassifier {
	/**
	 * @param {() => ProbabilityModel} model Function to generate the model
	 */
	constructor(model) {
		this._classes = null
		this._models = []
		this._modelcls = model
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		if (!this._classes) {
			this._classes = [...new Set(y)]
			for (let i = 0; i < this._classes.length; i++) {
				this._models[i] = this._modelcls()
			}
		}
		for (let i = 0; i < this._classes.length; i++) {
			const xi = x.filter((v, j) => this._classes[i] === y[j])
			this._models[i].fit(xi)
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {(* | null)[]} Predicted values
	 */
	predict(x) {
		const prob = []
		for (const model of this._models) {
			prob.push(model.probability(x))
		}

		const pred = []
		for (let i = 0; i < x.length; i++) {
			let max_p = 0
			pred[i] = null
			for (let k = 0; k < prob.length; k++) {
				if (max_p < prob[k][i]) {
					max_p = prob[k][i]
					pred[i] = this._classes[k]
				}
			}
		}
		return pred
	}
}
