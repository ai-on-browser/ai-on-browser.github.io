import NeuralNetwork from './neuralnetwork.js'

export default class Autoencoder {
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

		this._model = new NeuralNetwork(this._layers, 'mse', optimizer)
		this._epoch = 0
	}

	get epoch() {
		return this._epoch
	}

	fit(train_x, iteration, rate, batch, rho) {
		this._model.fit(train_x, train_x, iteration, rate, batch, { rho })
		this._epoch += iteration
	}

	predict(x) {
		const pred = this._model.calc(x)
		return pred.toArray()
	}

	reduce(x) {
		const red = this._model.calc(x, null, ['reduce'])
		return red.reduce.toArray()
	}
}
