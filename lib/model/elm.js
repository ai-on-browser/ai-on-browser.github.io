import Matrix from '../util/matrix.js'

/**
 * @ignore
 * @typedef {import("./nns/graph").LayerObject} LayerObject
 */

const ActivationFunctions = {
	identity: i => i,
	elu: i => (i > 0 ? i : Math.exp(i) - 1),
	gaussian: i => Math.exp(-(i ** 2) / 2),
	leaky_relu: i => (i > 0 ? i : 0.01 * i),
	sigmoid: i => 1 / (1 + Math.exp(-i)),
	softplus: i => Math.log(1 + Math.exp(i)),
	softsign: v => v / (1 + Math.abs(v)),
	tanh: Math.tanh,
}

class ELM {
	constructor(size, activation) {
		this._size = size
		this._activation = activation
		if (typeof activation === 'function') {
			this._a = activation
		} else {
			this._a = ActivationFunctions[activation]
		}

		this._w = null
		this._b = null
	}

	fit(x, y) {
		const d = x.cols
		this._w = Matrix.randn(d, this._size)
		this._b = Matrix.randn(1, this._size)

		const h = x.dot(this._w)
		h.add(this._b)
		h.map(this._a)

		const hinv = h.pseudoInv()
		this._beta = hinv.dot(y)
	}

	predict(x) {
		const h = x.dot(this._w)
		h.add(this._b)
		h.map(this._a)
		return h.dot(this._beta)
	}
}

/**
 * Extreme learning machine classifier
 */
export class ELMClassifier extends ELM {
	/**
	 * @param {number[]} size Size of hidden layer
	 * @param {'identity' | 'elu' | 'gaussian' | 'leaky_relu' | 'sigmoid' | 'softplus' | 'softsign' | 'tanh'} [activation] Activation name
	 */
	constructor(size, activation = 'tanh') {
		super(size, activation)
		this._classes = null
	}

	/**
	 * Category list
	 * @type {*[]}
	 */
	get categories() {
		return this._classes
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		if (!this._classes) {
			this._classes = [...new Set(y)]
		}
		const cy = y.map(v => {
			const yi = Array(this._classes.length).fill(0)
			yi[this._classes.indexOf(v)] = 1
			return yi
		})
		super.fit(Matrix.fromArray(x), Matrix.fromArray(cy))
	}

	/**
	 * Returns predicted probabilities.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	probability(x) {
		const p = super.predict(Matrix.fromArray(x))
		p.sub(p.max(1))
		p.map(Math.exp)
		p.div(p.sum(1))
		return p.toArray()
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(x) {
		return super
			.predict(Matrix.fromArray(x))
			.argmax(1)
			.value.map(v => this._classes[v])
	}
}

/**
 * Extreme learning machine regressor
 */
export class ELMRegressor extends ELM {
	/**
	 * @param {number[]} size Size of hidden layer
	 * @param {'identity' | 'elu' | 'gaussian' | 'leaky_relu' | 'sigmoid' | 'softplus' | 'softsign' | 'tanh'} [activation] Activation name
	 */
	constructor(size, activation = 'tanh') {
		super(size, activation)
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		super.fit(Matrix.fromArray(x), Matrix.fromArray(y))
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		return super.predict(Matrix.fromArray(x)).toArray()
	}
}
