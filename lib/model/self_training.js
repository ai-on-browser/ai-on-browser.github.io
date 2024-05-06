/**
 * Self-training
 */
export default class SelfTraining {
	// https://yamaguchiyuto.hatenablog.com/entry/machine-learning-advent-calendar-2014
	// https://aclanthology.org/P95-1026.pdf
	/**
	 * @param {object} model View
	 * @param {function (Array<Array<number>>, *[]): void} model.fit Fit model
	 * @param {function (Array<Array<number>>): Array<{category: *, score: number}>} model.predict Returns predicted values
	 * @param {number} threshold Threshold
	 */
	constructor(model, threshold) {
		this._model = model
		this._threshold = threshold
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {(* | null)[]} y Target values
	 */
	init(x, y) {
		this._x = x
		this._y = y
	}

	/**
	 * Fit model.
	 */
	fit() {
		const x = this._x.filter((v, i) => this._y[i] != null)
		const y = this._y.filter(v => v != null)

		this._model.fit(x, y)

		const nx = this._x.filter((v, i) => this._y[i] == null)
		const p = this._model.predict(nx)
		for (let i = 0, k = 0; i < this._y.length; i++) {
			if (this._y[i] != null) {
				continue
			}
			if (p[k].score > this._threshold) {
				this._y[i] = p[k].category
			}
			k++
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {(* | null)[]} Predicted values
	 */
	predict() {
		return this._y
	}
}
