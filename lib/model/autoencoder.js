import NeuralNetwork from './neuralnetwork.js'

/**
 * @ignore
 * @typedef {import("./nns/graph").LayerObject} LayerObject
 */

/**
 * Autoencoder
 */
export default class Autoencoder {
	/**
	 * @param {number} input_size Input size
	 * @param {number} reduce_size Reduced dimension
	 * @param {LayerObject[]} enc_layers Layers of encoder
	 * @param {LayerObject[]} dec_layers Layers of decoder
	 * @param {string} optimizer Optimizer of the network
	 */
	constructor(input_size, reduce_size, enc_layers, dec_layers, optimizer) {
		this._input_size = input_size
		this._layers = [{ type: 'input', name: 'in' }]
		this._layers.push(...enc_layers)
		this._layers.push(
			{
				type: 'full',
				out_size: reduce_size,
				name: 'reduce',
			},
			{
				type: 'sparsity',
				rho: 0.02,
				beta: 1,
			}
		)
		this._layers.push(...dec_layers)
		this._layers.push({
			type: 'full',
			out_size: 'in',
		})

		this._model = NeuralNetwork.fromObject(this._layers, 'mse', optimizer)
		this._epoch = 0
	}

	/**
	 * Epoch
	 * @type {number}
	 */
	get epoch() {
		return this._epoch
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {number} iteration Iteration count
	 * @param {number} rate Learning rate
	 * @param {number} batch Batch size
	 * @param {number} rho Sparsity parameter
	 * @returns {number} Loss value
	 */
	fit(train_x, iteration, rate, batch, rho) {
		const loss = this._model.fit(train_x, train_x, iteration, rate, batch, { rho })
		this._epoch += iteration
		return loss[0]
	}

	/**
	 * Returns predicted datas.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		const pred = this._model.calc(x)
		return pred.toArray()
	}

	/**
	 * Returns reduced datas.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	reduce(x) {
		const red = this._model.calc(x, null, ['reduce'])
		return red.reduce.toArray()
	}
}
