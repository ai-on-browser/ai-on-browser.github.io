import Matrix from '../util/matrix.js'
import { AdamOptimizer } from './nns/optimizer.js'

/**
 * @ignore
 * @typedef {import("./nns/graph").LayerObject} LayerObject
 */

const ActivationFunctions = {
	identity: { calc: i => i, grad: () => 1 },
	elu: { calc: i => (i > 0 ? i : Math.exp(i) - 1), grad: i => (i > 0 ? 1 : Math.exp(i)) },
	gaussian: { calc: i => Math.exp(-(i ** 2) / 2), grad: (i, o) => -o * i },
	leaky_relu: { calc: i => (i > 0 ? i : 0.01 * i), grad: i => (i > 0 ? 1 : 0.01) },
	relu: { calc: i => Math.max(0, i), grad: i => (i > 0 ? 1 : 0) },
	sigmoid: { calc: i => 1 / (1 + Math.exp(-i)), grad: (i, o) => o * (1 - o) },
	softplus: { calc: i => Math.log(1 + Math.exp(i)), grad: i => 1 / (1 + Math.exp(-i)) },
	softsign: { calc: v => v / (1 + Math.abs(v)), grad: i => 1 / (1 + Math.abs(i)) ** 2 },
	tanh: { calc: Math.tanh, grad: (i, o) => 1 - o ** 2 },
}

class MLP {
	constructor(layer_sizes, activations) {
		this._layer_sizes = layer_sizes
		this._activations = activations
		this._a = []

		this._w = []
		this._b = []
		for (let i = 0; i < layer_sizes.length - 1; i++) {
			this._a[i] = ActivationFunctions[activations[i]]
			this._w[i] = Matrix.randn(layer_sizes[i], layer_sizes[i + 1], 0, 0.1)
			this._b[i] = Matrix.zeros(1, layer_sizes[i + 1])
		}
		this._optimizer = new AdamOptimizer()
		this._optimizer_mng = this._optimizer.manager()
	}

	calc(x) {
		this._i = [x]
		this._o = [x]
		for (let i = 0; i < this._w.length; i++) {
			this._i[i + 1] = x = x.dot(this._w[i])
			x.add(this._b[i])
			this._o[i + 1] = x = x.copy()
			if (this._a[i]) {
				x.map(this._a[i].calc)
			}
		}
		return x
	}

	update(e, r) {
		this._optimizer.learningRate = r
		for (let i = this._w.length - 1; i >= 0; i--) {
			if (this._a[i]) {
				for (let k = 0; k < e.length; k++) {
					e.value[k] *= this._a[i].grad(this._i[i + 1].value[k], this._o[i + 1].value[k])
				}
			}
			const dw = this._o[i].tDot(e)
			dw.div(this._i[i].rows)
			const db = e.mean(0)
			e = e.dot(this._w[i].t)
			this._w[i].sub(this._optimizer_mng.delta(`w${i}`, dw))
			this._b[i].sub(this._optimizer_mng.delta(`b${i}`, db))
		}
	}

	toObject() {
		const layers = [{ type: 'input' }]
		for (let i = 0; i < this._layer_sizes.length - 1; i++) {
			layers.push({
				type: 'full',
				out_size: this._layer_sizes[i + 1],
				activation: this._activations[i],
				w: this._w[i]?.toArray(),
				b: this._b[i]?.toArray(),
			})
		}
		return layers
	}
}

/**
 * Multi layer perceptron classifier
 */
export class MLPClassifier {
	/**
	 * @param {number[]} hidden_sizes Sizes of hidden layers
	 * @param {'identity' | 'elu' | 'gaussian' | 'leaky_relu' | 'relu' | 'sigmoid' | 'softplus' | 'softsign' | 'tanh'} [activation] Activation name
	 */
	constructor(hidden_sizes, activation = 'tanh') {
		this._hidden_sizes = hidden_sizes
		this._activations = Array(this._hidden_sizes.length).fill(activation)

		this._model = null
		this._classes = null
		this._epoch = 0
	}

	/**
	 * Category list
	 *
	 * @type {*[]}
	 */
	get categories() {
		return this._classes
	}

	/**
	 * Epoch
	 *
	 * @type {number}
	 */
	get epoch() {
		return this._epoch
	}

	/**
	 * Returns object representation.
	 *
	 * @returns {LayerObject[]} Object represented this neuralnetwork
	 */
	toObject() {
		return [...this._model.toObject(), { type: 'softmax' }, { type: 'output' }]
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {*[]} train_y Target values
	 * @param {number} iteration Iteration count
	 * @param {number} [rate] Learning rate
	 * @param {number} [batch] Batch size
	 * @returns {number} Loss value
	 */
	fit(train_x, train_y, iteration, rate = 0.001, batch = 0) {
		if (!this._model) {
			this._classes = [...new Set(train_y)]
			const layer_sizes = [train_x[0].length, ...this._hidden_sizes, this._classes.length]
			this._model = new MLP(layer_sizes, this._activations)
		}
		const y = train_y.map(v => {
			const yi = Array(this._classes.length).fill(0)
			yi[this._classes.indexOf(v)] = 1
			return yi
		})
		const xs = []
		const ys = []
		if (batch > 0) {
			for (let k = 0; k < train_x.length; k += batch) {
				xs.push(Matrix.fromArray(train_x.slice(k, k + batch)))
				ys.push(Matrix.fromArray(y.slice(k, k + batch)))
			}
		} else {
			xs.push(Matrix.fromArray(train_x))
			ys.push(Matrix.fromArray(y))
		}
		let e
		for (let i = 0; i < iteration; i++) {
			for (let k = 0; k < xs.length; k++) {
				e = this._fitonce(xs[k], ys[k], rate)
			}
		}
		this._epoch += iteration
		e.map(v => v ** 2)
		return e.mean()
	}

	_fitonce(x, y, r) {
		const p = this._model.calc(x)
		p.sub(p.max(1))
		p.map(Math.exp)
		p.div(p.sum(1))
		const e = Matrix.sub(p, y)
		this._model.update(e, r)
		return e
	}

	/**
	 * Returns predicted probabilities.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	probability(x) {
		const p = this._model.calc(Matrix.fromArray(x))
		p.sub(p.max(1))
		p.map(Math.exp)
		p.div(p.sum(1))
		return p.toArray()
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(x) {
		return this._model
			.calc(Matrix.fromArray(x))
			.argmax(1)
			.value.map(v => this._classes[v])
	}
}

/**
 * Multi layer perceptron regressor
 */
export class MLPRegressor {
	/**
	 * @param {number[]} hidden_sizes Sizes of hidden layers
	 * @param {'identity' | 'elu' | 'gaussian' | 'leaky_relu' | 'relu' | 'sigmoid' | 'softplus' | 'softsign' | 'tanh'} [activation] Activation name
	 */
	constructor(hidden_sizes, activation = 'tanh') {
		this._hidden_sizes = hidden_sizes
		this._activations = Array(hidden_sizes.length).fill(activation)
		this._model = null
		this._epoch = 0
	}

	/**
	 * Epoch
	 *
	 * @type {number}
	 */
	get epoch() {
		return this._epoch
	}

	/**
	 * Returns object representation.
	 *
	 * @returns {LayerObject[]} Object represented this neuralnetwork
	 */
	toObject() {
		return [...this._model.toObject(), { type: 'output' }]
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<Array<number>>} train_y Target values
	 * @param {number} iteration Iteration count
	 * @param {number} [rate] Learning rate
	 * @param {number} [batch] Batch size
	 * @returns {number} Loss value
	 */
	fit(train_x, train_y, iteration, rate = 0.001, batch = 0) {
		if (!this._model) {
			const layer_sizes = [train_x[0].length, ...this._hidden_sizes, train_y[0].length]
			this._model = new MLP(layer_sizes, this._activations)
		}
		const xs = []
		const ys = []
		if (batch > 0) {
			for (let k = 0; k < train_x.length; k += batch) {
				xs.push(Matrix.fromArray(train_x.slice(k, k + batch)))
				ys.push(Matrix.fromArray(train_y.slice(k, k + batch)))
			}
		} else {
			xs.push(Matrix.fromArray(train_x))
			ys.push(Matrix.fromArray(train_y))
		}
		let e
		for (let i = 0; i < iteration; i++) {
			for (let k = 0; k < xs.length; k++) {
				e = this._fitonce(xs[k], ys[k], rate)
			}
		}
		this._epoch += iteration
		e.map(v => v ** 2)
		return e.mean()
	}

	_fitonce(x, y, r) {
		const p = this._model.calc(x)
		const e = Matrix.sub(p, y)
		e.div(2)
		this._model.update(e, r)
		return e
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const pred = this._model.calc(x)
		return pred.toArray()
	}
}
