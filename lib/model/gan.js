import { Matrix } from '../util/math.js'
import Neuralnetwork from './neuralnetwork.js'

/**
 * Generative adversarial networks
 */
export default class GAN {
	/**
	 * Constructor
	 * @param {number} noise_dim
	 * @param {Record<string, *>[]} g_hidden
	 * @param {Record<string, *>[]} d_hidden
	 * @param {string} g_opt
	 * @param {string} d_opt
	 * @param {number} class_size
	 * @param {'' | 'conditional'} type
	 */
	constructor(noise_dim, g_hidden, d_hidden, g_opt, d_opt, class_size, type) {
		this._type = type
		this._noise_dim = noise_dim
		this._epoch = 0
		const discriminatorNetLayers = [{ type: 'input', name: 'dic_in' }]
		const generatorNetLeyers = [{ type: 'input', name: 'gen_in' }]
		if (type === 'conditional') {
			discriminatorNetLayers.push(
				{ type: 'input', name: 'cond', input: [] },
				{ type: 'onehot', name: 'cond_oh', input: ['cond'], class_size: class_size },
				{ type: 'concat', input: ['dic_in', 'cond_oh'] }
			)
			generatorNetLeyers.push(
				{ type: 'input', name: 'cond', input: [] },
				{ type: 'onehot', name: 'cond_oh', input: ['cond'], class_size: class_size },
				{ type: 'concat', input: ['gen_in', 'cond_oh'] }
			)
		}
		discriminatorNetLayers.push(...d_hidden, { type: 'full', out_size: 2 }, { type: 'softmax' })
		generatorNetLeyers.push(
			...g_hidden,
			{ type: 'full', out_size: 2 },
			{ type: 'leaky_relu', a: 0.1, name: 'generate' }
		)
		this._discriminator = new Neuralnetwork(discriminatorNetLayers, 'mse', d_opt)

		generatorNetLeyers.push({ type: 'include', net: this._discriminator, input_to: 'dic_in', train: false })
		this._generator = new Neuralnetwork(generatorNetLeyers, 'mse', g_opt)
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
	 * @param {Array<Array<number>>} y
	 * @param {number} step
	 * @param {number} gen_rate
	 * @param {number} dis_rate
	 * @param {number} batch
	 * @returns {Array<Array<number>>}
	 */
	fit(x, y, step, gen_rate, dis_rate, batch) {
		const cond = y
		const cond2 = [].concat(cond, cond)
		y = Array(x.length).fill([1, 0])
		for (let i = 0; i < x.length; i++) {
			y.push([0, 1])
		}
		const true_out = Array(x.length).fill([1, 0])
		let gen_data = null
		for (let i = 0; i < step; i++) {
			gen_data = this.generate(x.length, cond)
			this._discriminator.fit({ dic_in: [].concat(x, gen_data), cond: cond2 }, y, 1, dis_rate, batch)
			const gen_noise = Matrix.randn(x.length, this._noise_dim).toArray()
			this._generator.fit({ gen_in: gen_noise, cond: cond }, true_out, 1, gen_rate, batch)
			this._epoch++
		}
		return gen_data
	}

	/**
	 * Returns probabilities of the data is true.
	 * @param {Array<Array<number>>} x
	 * @param {*} y
	 * @returns {Array<Array<number>>}
	 */
	prob(x, y) {
		const data = this._discriminator.calc({ dic_in: x, cond: y })
		return data.toArray()
	}

	/**
	 * Returns generated data from the model.
	 * @param {number} n
	 * @param {Array<Array<number>>} y
	 * @returns {Array<Array<number>>}
	 */
	generate(n, y) {
		const gen_noise = Matrix.randn(n, this._noise_dim).toArray()
		const data = this._generator.calc({ gen_in: gen_noise, cond: y }, null, ['generate'])
		return data.generate.toArray()
	}
}
