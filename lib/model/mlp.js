import NeuralNetwork from './neuralnetwork.js'

/**
 * Multi layer perceptron classifier
 */
export class MLPClassifier {
	/**
	 * @param {number[]} hidden_sizes Sizes of hidden layers
	 * @param {string} activation Activation name
	 * @param {string} optimizer Optimizer of the network
	 */
	constructor(hidden_sizes, activation, optimizer) {
		this._layers = [{ type: 'input' }]
		for (let i = 0; i < hidden_sizes.length; i++) {
			this._layers.push({ type: 'full', out_size: hidden_sizes[i], activation: activation })
		}

		this._model = null
		this._classes = null
		this._optimizer = optimizer
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
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {*[]} train_y Target values
	 * @param {number} iteration Iteration count
	 * @param {number} rate Learning rate
	 * @param {number} batch Batch size
	 */
	fit(train_x, train_y, iteration, rate, batch) {
		if (!this._model) {
			this._classes = [...new Set(train_y)]
			this._layers.push({ type: 'full', out_size: this._classes.length })
			this._model = NeuralNetwork.fromObject(this._layers, 'mse', this._optimizer)
		}
		const y = train_y.map(v => {
			const yi = Array(this._classes.length).fill(0)
			yi[this._classes.indexOf(v)] = 1
			return yi
		})
		this._model.fit(train_x, y, iteration, rate, batch)
		this._epoch += iteration
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(x) {
		return this._model
			.calc(x)
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
	 * @param {string} activation Activation name
	 * @param {string} optimizer Optimizer of the network
	 */
	constructor(hidden_sizes, activation, optimizer) {
		this._layers = [{ type: 'input' }]
		for (let i = 0; i < hidden_sizes.length; i++) {
			this._layers.push({ type: 'full', out_size: hidden_sizes[i], activation: activation })
		}

		this._model = null
		this._optimizer = optimizer
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
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {Array<Array<number>>} train_y Target values
	 * @param {number} iteration Iteration count
	 * @param {number} rate Learning rate
	 * @param {number} batch Batch size
	 */
	fit(train_x, train_y, iteration, rate, batch) {
		if (!this._model) {
			this._layers.push({ type: 'full', out_size: train_y[0].length })
			this._model = NeuralNetwork.fromObject(this._layers, 'mse', this._optimizer)
		}
		this._model.fit(train_x, train_y, iteration, rate, batch)
		this._epoch += iteration
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const pred = this._model.calc(x)
		return pred.toArray()
	}
}
