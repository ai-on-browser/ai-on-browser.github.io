import { DecisionTreeRegression } from './decision_tree.js'
import GradientBoosting from './gradient_boosting.js'

/**
 * Gradient boosting decision tree
 */
export class GBDT {
	// https://www.acceluniverse.com/blog/developers/2019/12/gbdt.html
	// https://techblog.nhn-techorus.com/archives/14801
	/**
	 * @param {number} [maxdepth] Maximum depth of tree
	 * @param {number} [srate] Sampling rate
	 * @param {number} [lr] Learning rate
	 */
	constructor(maxdepth = 1, srate = 1.0, lr = 0) {
		this._maxd = maxdepth
		this._srate = srate
		this._model = new GradientBoosting(() => {
			const tree = new DecisionTreeRegression()
			return {
				tree,
				fit: (x, y) => {
					const idx = this._sample(x.length)
					tree.init(
						idx.map(i => x[i]),
						idx.map(i => y[i].concat())
					)
					for (let i = 0; i < this._maxd; i++) {
						tree.fit()
					}
				},
				predict: x => tree.predict(x),
			}
		}, lr)
	}

	/**
	 * Number of trees
	 * @type {number}
	 */
	get size() {
		return this._model.size
	}

	_sample(n) {
		const arr = Array.from({ length: n }, (_, i) => i)
		for (let i = n - 1; i > 0; i--) {
			const r = Math.floor(Math.random() * (i + 1))
			;[arr[i], arr[r]] = [arr[r], arr[i]]
		}
		return arr.slice(0, Math.ceil(n * this._srate))
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	init(x, y) {
		this._model.init(x, y)
	}

	/**
	 * Fit model.
	 */
	fit() {
		this._model.fit()
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		return this._model.predict(x)
	}
}

/**
 * Gradient boosting decision tree classifier
 */
export class GBDTClassifier extends GBDT {
	/**
	 * @param {number} [maxdepth] Maximum depth of tree
	 * @param {number} [srate] Sampling rate
	 * @param {number} [lr] Learning rate
	 */
	constructor(maxdepth = 1, srate = 1.0, lr = 0) {
		super(maxdepth, srate, lr)
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	init(x, y) {
		this._cls = [...new Set(y)]
		this._y = Array.from(y, () => Array(this._cls.length).fill(0))
		for (let i = 0; i < this._y.length; i++) {
			this._y[i][this._cls.indexOf(y[i])] = 1
		}
		super.init(x, this._y)
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(x) {
		const p = super.predict(x)
		return p.map(pi => {
			let max_v = -Infinity
			let max_k = -1
			for (let i = 0; i < pi.length; i++) {
				if (max_v < pi[i]) {
					max_v = pi[i]
					max_k = i
				}
			}
			return this._cls[max_k]
		})
	}
}
