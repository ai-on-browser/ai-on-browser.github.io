import Matrix from '../util/matrix.js'

/**
 * @typedef {object} SubModel
 * @property {function(Array<Array<number>>, Array<Array<number>>): void} fit Fit model
 * @property {function(Array<Array<number>>): Array<Array<number>>} predict Returns predicted values
 */
/**
 * Gradient boosting
 */
export default class GradientBoosting {
	// https://ja.wikipedia.org/wiki/%E5%8B%BE%E9%85%8D%E3%83%96%E3%83%BC%E3%82%B9%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0
	/**
	 * @param {() => SubModel} model Function to generate the model
	 * @param {number} [lr] Learning rate
	 */
	constructor(model, lr = 0) {
		this._model = model
		this._submodels = []
		this._r = []
		this._lr = lr
	}

	/**
	 * Number of submodels
	 * @type {number}
	 */
	get size() {
		return this._submodels.length
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	init(x, y) {
		this._x = x
		this._loss = y.map(v => v.concat())
	}

	/**
	 * Fit model.
	 */
	fit() {
		const model = this._model()
		model.fit(
			this._x,
			this._loss.map(l => l.concat())
		)
		this._submodels.push(model)

		const p = Matrix.fromArray(model.predict(this._x))
		let r = this._lr
		if (!r) {
			const pdp = p.tDot(p)
			const d = this._loss[0].length
			pdp.add(Matrix.eye(d, d, 1.0e-8))
			const lr = pdp.solve(p.tDot(Matrix.fromArray(this._loss)))
			r = lr.diag().reduce((s, v) => s + v, 0) / d
		}
		this._r.push(r)

		for (let i = 0; i < this._loss.length; i++) {
			for (let j = 0; j < this._loss[i].length; j++) {
				this._loss[i][j] -= r * p.at(i, j)
			}
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const ps = this._submodels.map(t => t.predict(x))
		const p = Array.from(x, () => Array(this._loss[0].length).fill(0))
		for (let k = 0; k < ps.length; k++) {
			for (let i = 0; i < ps[k].length; i++) {
				for (let j = 0; j < ps[k][i].length; j++) {
					p[i][j] += this._r[k] * ps[k][i][j]
				}
			}
		}
		return p
	}
}
