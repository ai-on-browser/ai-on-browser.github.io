import NeuralNetwork from './neuralnetwork.js'

/**
 * Recurrent neuralnetwork
 */
export default class RNN {
	/**
	 * @param {'rnn' | 'lstm' | 'gru'} [method=lstm] Method name
	 * @param {number} [window=10] Window size
	 * @param {number} [unit=10] Size of recurrent unit
	 * @param {number} [out_size=1] Output size
	 * @param {string} [optimizer=adam] Optimizer of the network
	 */
	constructor(method = 'lstm', window = 10, unit = 10, out_size = 1, optimizer = 'adam') {
		this._window = window
		this._method = method
		this._layers = [{ type: 'input' }]
		this._layers.push({
			type: method,
			size: unit,
		})
		this._layers.push({ type: 'full', out_size })

		this._model = NeuralNetwork.fromObject(this._layers, 'mse', optimizer)
		this._epoch = 0
	}

	/**
	 * Method
	 *
	 * @type {'rnn' | 'lstm' | 'gru'}
	 */
	get method() {
		return this._method
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
		const x = []
		for (let t = 0; t < train_x.length - this._window; t++) {
			x.push(train_x.slice(t, t + this._window))
		}
		const y = train_y.slice(this._window)
		this._model.fit(x, y, iteration, rate, batch)
		this._epoch += iteration
	}

	/**
	 * Returns predicted future values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @param {number} k Prediction count
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(data, k) {
		const preds = []
		const lasts = data.slice(data.length - this._window)
		for (let i = 0; i < k; i++) {
			const last = [lasts]
			const pred = this._model.calc(last).toArray()[0]
			preds.push(pred)
			lasts.push(pred)
			lasts.shift()
		}
		return preds
	}
}
