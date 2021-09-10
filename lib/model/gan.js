import { Matrix } from '../util/math.js'

class GANWorker extends BaseWorker {
	constructor() {
		super('lib/model/worker/neuralnetwork_worker.js', { type: 'module' })
	}

	initialize(layers, optimizer, cb) {
		this._postMessage(
			{
				mode: 'init',
				layers: layers,
				loss: 'mse',
				optimizer: optimizer,
			},
			cb
		)
	}

	fit(id, train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage(
			{
				id: id,
				mode: 'fit',
				x: train_x,
				y: train_y,
				iteration: iteration,
				batch_size: batch,
				rate: rate,
			},
			cb
		)
	}

	predict(id, x, out, cb) {
		this._postMessage(
			{
				id: id,
				mode: 'predict',
				x: x,
				out: out,
			},
			cb
		)
	}

	remove(id) {
		this._postMessage({
			id: id,
			mode: 'close',
		})
	}
}

export default class GAN {
	constructor() {
		this._model = new GANWorker()

		this._discriminatorNetId = null
		this._generatorNetId = null
	}

	get epoch() {
		return this._epoch
	}

	init(noise_dim, g_hidden, d_hidden, g_opt, d_opt, class_size, type) {
		if (this._discriminatorNetId) {
			this._model.remove(this._discriminatorNetId)
			this._model.remove(this._generatorNetId)
		}
		this._type = type
		this._noise_dim = noise_dim
		let discriminatorNetLayers = [{ type: 'input', name: 'dic_in' }]
		let generatorNetLeyers = [{ type: 'input', name: 'gen_in' }]
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
		this._model.initialize(discriminatorNetLayers, d_opt, e => {
			this._discriminatorNetId = e.data
			generatorNetLeyers.push({ type: 'include', id: this._discriminatorNetId, input_to: 'dic_in', train: false })
			this._model.initialize(generatorNetLeyers, g_opt, e => {
				this._generatorNetId = e.data
			})
		})
	}

	terminate() {
		this._model.terminate()
	}

	fit(x, y, step, gen_rate, dis_rate, batch, cb) {
		const cond = y
		const cond2 = [].concat(cond, cond)
		y = Array(x.length).fill([1, 0])
		for (let i = 0; i < x.length; i++) {
			y.push([0, 1])
		}
		const true_out = Array(x.length).fill([1, 0])
		const loop = () => {
			this.generate(x.length, cond, gen_data => {
				this._model.fit(
					this._discriminatorNetId,
					{ dic_in: [].concat(x, gen_data), cond: cond2 },
					y,
					1,
					dis_rate,
					batch,
					e => {
						const gen_noise = Matrix.randn(x.length, this._noise_dim).toArray()
						this._model.fit(
							this._generatorNetId,
							{ gen_in: gen_noise, cond: cond },
							true_out,
							1,
							gen_rate,
							batch,
							e => {
								this._epoch = e.data.epoch
								if (--step <= 0) {
									cb && cb(gen_data)
								} else {
									loop()
								}
							}
						)
					}
				)
			})
		}
		loop()
	}

	prob(x, y, cb) {
		this._model.predict(this._discriminatorNetId, { dic_in: x, cond: y }, null, e => {
			const pred_data = e.data
			cb && cb(pred_data)
		})
	}

	generate(n, y, cb) {
		const gen_noise = Matrix.randn(n, this._noise_dim).toArray()
		this._model.predict(this._generatorNetId, { gen_in: gen_noise, cond: y }, ['generate'], e => {
			const gen_data = e.data.generate
			cb && cb(gen_data)
		})
	}
}
