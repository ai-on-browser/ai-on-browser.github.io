import Matrix from '../util/matrix.js'
import NeuralNetwork from './neuralnetwork.js'

/**
 * Generative adversarial networks
 */
export default class GAN {
	/**
	 * @param {number} noise_dim Number of noise dimension
	 * @param {Object<string, *>[]} g_hidden Layers of generator
	 * @param {Object<string, *>[]} d_hidden Layers of discriminator
	 * @param {string} g_opt Optimizer of the generator network
	 * @param {string} d_opt Optimizer of the discriminator network
	 * @param {number | null} class_size Class size for conditional type
	 * @param {'' | 'conditional'} type Type name
	 */
	constructor(noise_dim, g_hidden, d_hidden, g_opt, d_opt, class_size, type) {
		this._type = type
		this._noise_dim = noise_dim
		this._epoch = 0
		const discriminatorNetLayers = [{ type: 'input', name: 'dic_in' }]
		this._generatorNetLeyers = [{ type: 'input', name: 'gen_in' }]
		if (type === 'conditional') {
			discriminatorNetLayers.push(
				{ type: 'input', name: 'cond', input: [] },
				{ type: 'onehot', name: 'cond_oh', input: ['cond'], class_size: class_size },
				{ type: 'concat', input: ['dic_in', 'cond_oh'] }
			)
			this._generatorNetLeyers.push(
				{ type: 'input', name: 'cond', input: [] },
				{ type: 'onehot', name: 'cond_oh', input: ['cond'], class_size: class_size },
				{ type: 'concat', input: ['gen_in', 'cond_oh'] }
			)
		}
		discriminatorNetLayers.push(...d_hidden, { type: 'full', out_size: 2 }, { type: 'softmax' })
		this._generatorNetLeyers.push(...g_hidden)
		this._discriminator = NeuralNetwork.fromObject(discriminatorNetLayers, 'mse', d_opt)
		this._g_opt = g_opt
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
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>> | null} y Conditional values
	 * @param {number} step Iteration count
	 * @param {number} gen_rate Learning rate for generator
	 * @param {number} dis_rate Learning rate for discriminator
	 * @param {number} batch Batch size
	 * @returns {{generatorLoss: number, discriminatorLoss: number}} Loss value
	 */
	fit(x, y, step, gen_rate, dis_rate, batch) {
		if (!this._generator) {
			this._generatorNetLeyers.push(
				{ type: 'full', out_size: x[0].length },
				{ type: 'leaky_relu', a: 0.1, name: 'generate' }
			)

			this._generatorNetLeyers.push({
				type: 'include',
				net: this._discriminator,
				input_to: 'dic_in',
				train: false,
			})
			this._generator = NeuralNetwork.fromObject(this._generatorNetLeyers, 'mse', this._g_opt)
		}
		const cond = y
		const cond2 = [].concat(cond, cond)
		y = Array(x.length).fill([1, 0])
		for (let i = 0; i < x.length; i++) {
			y.push([0, 1])
		}
		const true_out = Array(x.length).fill([1, 0])
		let gLoss = null
		let dLoss = null
		for (let i = 0; i < step; i++) {
			const gen_data = this.generate(x.length, cond)
			dLoss = this._discriminator.fit({ dic_in: [].concat(x, gen_data), cond: cond2 }, y, 1, dis_rate, batch)
			const gen_noise = Matrix.randn(x.length, this._noise_dim).toArray()
			gLoss = this._generator.fit({ gen_in: gen_noise, cond: cond }, true_out, 1, gen_rate, batch)
			this._epoch++
		}
		return { discriminatorLoss: dLoss[0], generatorLoss: gLoss[0] }
	}

	/**
	 * Returns probabilities of the data is true.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @param {*} y Conditional values
	 * @returns {Array<Array<number>>} Predicted values
	 */
	prob(x, y) {
		const data = this._discriminator.calc({ dic_in: x, cond: y })
		return data.toArray()
	}

	/**
	 * Returns generated data from the model.
	 *
	 * @param {number} n Number of generated data
	 * @param {Array<Array<number>> | null} y Conditional values
	 * @returns {Array<Array<number>>} Generated values
	 */
	generate(n, y) {
		const gen_noise = Matrix.randn(n, this._noise_dim).toArray()
		const data = this._generator.calc({ gen_in: gen_noise, cond: y }, null, ['generate'])
		return data.generate.toArray()
	}
}
