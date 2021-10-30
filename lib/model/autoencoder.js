import NeuralNetwork from './neuralnetwork.js'

/**
 * Autoencoder
 */
export default class Autoencoder {
	/**
	 * @param {number} input_size
	 * @param {number} reduce_size
	 * @param {Record<string, *>[]} enc_layers
	 * @param {Record<string, *>[]} dec_layers
	 * @param {string} optimizer
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
			out_size: input_size,
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
	 * @param {Array<Array<number>>} train_x
	 * @param {number} iteration
	 * @param {number} rate
	 * @param {number} batch
	 * @param {number} rho
	 */
	fit(train_x, iteration, rate, batch, rho) {
		this._model.fit(train_x, train_x, iteration, rate, batch, { rho })
		this._epoch += iteration
	}

	/**
	 * Returns predicted datas.
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		const pred = this._model.calc(x)
		return pred.toArray()
	}

	/**
	 * Returns reduced datas.
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	reduce(x) {
		const red = this._model.calc(x, null, ['reduce'])
		return red.reduce.toArray()
	}
}
