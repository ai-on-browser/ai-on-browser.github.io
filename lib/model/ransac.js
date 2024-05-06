/**
 * @typedef {object} RANSACSubModel
 * @property {function(Array<Array<number>>, *[]): void} fit Fit model
 * @property {function(Array<Array<number>>): *[]} predict Returns predicted values
 * @property {function(*[], *[]): number} [score] Returns a number how accurate the prediction is
 */
/**
 * Random sample consensus
 */
export default class RANSAC {
	// https://qiita.com/kazetof/items/b3439d9258cc85ddf66b
	/**
	 * @param {new () => RANSACSubModel} model Function to generate the model
	 * @param {number | null} [sample] Sampling rate
	 */
	constructor(model, sample = null) {
		this._model = model
		this._sample = sample

		this._best_score = Infinity
		this._best_model = null
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		const n = this._sample ?? x[0].length + 1
		const idx = []
		for (let i = 0; i < n; i++) {
			idx.push(Math.floor(Math.random() * (x.length - i)))
		}
		for (let i = n - 1; i >= 0; i--) {
			for (let j = n - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}

		const xt = idx.map(v => x[v])
		const yt = idx.map(v => y[v])

		const mdl = new this._model()
		mdl.fit(xt, yt)

		const pred = mdl.predict(x)

		let score = Infinity
		if (mdl.score) {
			score = mdl.score(pred, y)
		} else {
			if (Array.isArray(y[0])) {
				score = Math.sqrt(
					pred.reduce((s, r, i) => s + r.reduce((t, v, j) => t + (v - y[i][j]) ** 2, 0), 0) / y.length
				)
			} else {
				score = Math.sqrt(pred.reduce((s, v, i) => s + (v - y[i]) ** 2, 0) / y.length)
			}
		}
		if (score < this._best_score) {
			this._best_model = mdl
			this._best_score = score
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(x) {
		return this._best_model.predict(x)
	}
}
