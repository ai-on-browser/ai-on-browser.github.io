import NeuralNetwork from './neuralnetwork.js'

/**
 * Variational Autoencoder
 */
export default class VAE {
	// https://tips-memo.com/vae-pytorch
	// https://nzw0301.github.io/assets/pdf/vae.pdf
	/**
	 * @param {number} in_size
	 * @param {number} noise_dim
	 * @param {Record<string, *>[]} enc_layers
	 * @param {Record<string, *>[]} dec_layers
	 * @param {string} optimizer
	 * @param {number | null} class_size
	 * @param {'' | 'conditional'} type
	 */
	constructor(in_size, noise_dim, enc_layers, dec_layers, optimizer, class_size, type) {
		this._type = type
		this._reconstruct_rate = 10
		this._epoch = 0

		let decodeLayers = [{ type: 'input', name: 'dec_in' }]
		if (type === 'conditional') {
			decodeLayers.push(
				{ type: 'input', name: 'cond', input: [] },
				{ type: 'onehot', name: 'cond_oh', input: ['cond'], class_size: class_size },
				{ type: 'concat', input: ['dec_in', 'cond_oh'] }
			)
		}
		decodeLayers.push(...dec_layers, { type: 'full', out_size: in_size })
		let aeLayers = [{ type: 'input', name: 'enc_in' }]
		if (type === 'conditional') {
			aeLayers.push(
				{ type: 'input', name: 'cond', input: [] },
				{ type: 'onehot', name: 'cond_oh', input: ['cond'], class_size: class_size },
				{ type: 'concat', input: ['enc_in', 'cond_oh'] }
			)
		}
		aeLayers.push(
			...enc_layers,
			{ type: 'full', out_size: noise_dim * 2 },
			{ type: 'split', size: [noise_dim, noise_dim], name: 'param' },
			{ type: 'abs', input: ['param[0]'], name: 'var' },
			{ type: 'linear', input: ['param[1]'], name: 'mean' },
			{ type: 'random', size: noise_dim, input: [], name: 'random' },
			{ type: 'mult', input: ['random', 'var'], name: 'mult' },
			{ type: 'add', input: ['mult', 'mean'] }
		)

		this._decodeNet = NeuralNetwork.fromObject(decodeLayers, null, optimizer)
		aeLayers.push(
			{ type: 'include', net: this._decodeNet, input_to: 'dec_in', train: true },
			{ type: 'output', name: 'output' },
			{ type: 'log', input: 'var', name: 'log_var' },
			{ type: 'square', input: 'mean', name: 'mean^2' },
			{ type: 'add', input: [1, 'log_var'], name: 'add' },
			{ type: 'sub', input: ['add', 'mean^2', 'var'] },
			{ type: 'sum', axis: 1 },
			{ type: 'mean', name: 'kl_0' },
			{ type: 'mult', input: ['kl_0', -0.5 / this._reconstruct_rate] },
			{ type: 'sum', name: 'kl' },

			{ type: 'sub', input: ['enc_in', 'output'] },
			{ type: 'square' },

			//{type: 'log', input: 'output', name: 'log_y'},
			//{type: 'mult', input: ['input', 'log_y'], name: 'x*log_y'},
			//{type: 'sub', input: [1, 'input'], name: '1-x'},
			//{type: 'sub', input: [1, 'output']},
			//{type: 'log', name: 'log_1-y'},
			//{type: 'mult', input: ['1-x', 'log_1-y'], name: '1-x*log_1-y'},
			//{type: 'add', input: ['x*log_y', '1-x*log_1-y']},
			//{type: 'sum', axis: 1},
			{ type: 'mean', name: 'recon' },
			{ type: 'add', input: ['kl', 'recon'] }
		)
		this._aeNet = NeuralNetwork.fromObject(aeLayers, null, optimizer)
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
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>> | null} y
	 * @param {number} iteration
	 * @param {number} rate
	 * @param {number} batch
	 */
	fit(x, y, iteration, rate, batch) {
		this._aeNet.fit({ enc_in: x, cond: y }, x, iteration, rate, batch)
		this._epoch += iteration
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>> | null} y
	 * @returns {Array<Array<number>>}
	 */
	predict(x, y) {
		const pred = this._aeNet.calc({ enc_in: x, cond: y })
		return pred.toArray()
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>> | null} y
	 * @returns {Array<Array<number>>}
	 */
	reduce(x, y) {
		const pred = this._aeNet.calc({ enc_in: x, cond: y }, null, ['mean'])
		return pred.mean.toArray()
	}
}
