import Matrix from '../util/matrix.js'
import Tensor from '../util/tensor.js'
import NeuralNetwork from './neuralnetwork.js'

/**
 * Diffusion model network
 */
export default class DiffusionModel {
	// https://qiita.com/pocokhc/items/5a015ee5b527a357dd67
	/**
	 * @param {number} timesteps Number of timestep
	 * @param {LayerObject[]} [layers] Layers
	 */
	constructor(timesteps, layers) {
		this._timesteps = timesteps
		this._ulayers = layers
		this._peDims = 32

		this._model = null
		this._epoch = 0

		const betaStart = 0.0001
		const betaEnd = 0.02
		const betaStep = (betaEnd - betaStart) / (this._timesteps - 1)
		this._beta = [betaStart]
		for (let t = 1; t < this._timesteps - 1; t++) {
			this._beta[t] = betaStart + betaStep * t
		}
		this._beta.push(betaEnd)
		this._alpha = [1 - this._beta[0]]
		this._alphaCumprod = [this._alpha[0]]
		for (let t = 1; t < this._beta.length; t++) {
			this._alpha[t] = 1 - this._beta[t]
			this._alphaCumprod[t] = this._alphaCumprod[t - 1] * this._alpha[t]
		}
	}

	/**
	 * Epoch
	 * @type {number}
	 */
	get epoch() {
		return this._epoch
	}

	_addNoise(x, t) {
		const at = this._alphaCumprod[t]
		const sqrtat = Math.sqrt(at)
		const sqrt1at = Math.sqrt(1 - at)
		const noize = Tensor.randn(x.sizes)
		const xNoised = x.copy()
		xNoised.broadcastOperate(noize, (a, b) => sqrtat * a + sqrt1at * b)
		return [xNoised, noize]
	}

	_build() {
		if (this._dataShape.length === 1) {
			this._layers = [
				{ type: 'input', name: 'x' },
				{ type: 'input', name: 'position_encoding' },
				{ type: 'full', out_size: this._peDims, l2_decay: 0.001, activation: 'gelu', name: 'pe' },
				{ type: 'concat', input: ['x', 'pe'], axis: 1 },
			]
			if (this._ulayers) {
				this._layers.push(...this._ulayers)
			} else {
				this._layers.push(
					{ type: 'full', out_size: 32, l2_decay: 0.001, name: 'c1', activation: 'tanh' },
					{ type: 'full', out_size: 16, l2_decay: 0.001, activation: 'tanh' },
					{ type: 'full', out_size: 32, l2_decay: 0.001, name: 'u1', activation: 'tanh' },
					{ type: 'concat', input: ['u1', 'c1'], axis: 1 },
					{ type: 'full', out_size: 32, l2_decay: 0.001, activation: 'tanh' }
				)
			}
			this._layers.push({ type: 'full', out_size: this._dataShape[0], l2_decay: 0.001 }, { type: 'output' })
		} else {
			const dim = this._dataShape.length
			this._layers = [
				{ type: 'input', name: 'x' },
				{ type: 'input', name: 'position_encoding' },
				{ type: 'full', out_size: this._peDims, l2_decay: 0.001, activation: 'gelu' },
				{ type: 'reshape', size: [...Array(dim - 1).fill(1), this._peDims] },
				{ type: 'up_sampling', size: this._dataShape.slice(0, dim - 1), name: 'pe' },
				{ type: 'concat', input: ['x', 'pe'], axis: dim },
			]
			if (this._ulayers) {
				this._layers.push(...this._ulayers)
			} else {
				this._layers.push(
					{
						type: 'conv',
						kernel: 3,
						channel: 16,
						padding: 1,
						l2_decay: 0.001,
						name: 'c1',
						activation: 'relu',
					},
					{ type: 'max_pool', kernel: 2 },
					{ type: 'conv', kernel: 3, channel: 32, padding: 1, l2_decay: 0.001, activation: 'relu' },
					{ type: 'up_sampling', size: 2, name: 'u1' },
					{ type: 'concat', input: ['u1', 'c1'], axis: dim },
					{ type: 'conv', kernel: 3, channel: 16, padding: 1, l2_decay: 0.001, activation: 'relu' }
				)
			}
			this._layers.push(
				{ type: 'conv', kernel: 1, channel: this._dataShape[dim - 1], l2_decay: 0.001 },
				{ type: 'output' }
			)
		}

		return NeuralNetwork.fromObject(this._layers, 'mse', 'adam')
	}

	_positionEncoding(t, embdims) {
		const rates = Array.from({ length: embdims }, (_, i) => t / 10000 ** (2 * Math.floor(i / 2)) / embdims)
		const pe = rates.map((v, i) => (i % 2 === 0 ? Math.sin(v) : Math.cos(v)))
		return new Matrix(1, embdims, pe)
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {number} iteration Iteration count
	 * @param {number} rate Learning rate
	 * @param {number} batch Batch size
	 * @returns {{labeledLoss: number, unlabeledLoss: number}} Loss value
	 */
	fit(train_x, iteration, rate, batch) {
		const x = Tensor.fromArray(train_x)
		this._dataShape = x.sizes.slice(1)
		if (!this._model) {
			this._model = this._build()
		}
		let loss = null
		for (let i = 0; i < iteration; i++) {
			const t = Math.floor(Math.random() * this._timesteps)
			const pe = this._positionEncoding(t, this._peDims)
			pe.repeat(x.sizes[0], 0)
			const [noised_x, noise] = this._addNoise(x, t)

			loss = this._model.fit({ x: noised_x, position_encoding: pe }, Tensor.fromArray(noise), 1, rate, batch)
		}
		this._epoch += iteration
		return loss
	}

	/**
	 * Returns generated data from the model.
	 * @param {number} n Number of generated data
	 * @returns {Array<Array<number>>} Generated values
	 */
	generate(n) {
		const ds = this._dataShape.concat()
		const samples = Tensor.randn([n, ...ds])
		for (let t = this._timesteps - 1; t >= 0; t--) {
			const pe = this._positionEncoding(t, this._peDims)
			pe.repeat(n, 0)

			const pred = this._model.calc({ x: samples, position_encoding: pe })

			samples.broadcastOperate(
				pred,
				(a, b) =>
					(1 / Math.sqrt(this._alpha[t])) * (a - (b * this._beta[t]) / Math.sqrt(1 - this._alphaCumprod[t]))
			)
			if (t > 0) {
				const s2 = ((1 - this._alphaCumprod[t - 1]) / (1 - this._alphaCumprod[t])) * this._beta[t]
				const noise = Tensor.randn(samples.sizes, 0, s2)
				samples.broadcastOperate(noise, (a, b) => a + b)
			}
		}

		return samples.toArray()
	}
}
