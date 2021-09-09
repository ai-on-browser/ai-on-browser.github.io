class VAEWorker extends BaseWorker {
	constructor() {
		super('model/worker/neuralnetwork_worker.js', { type: 'module' })
	}

	initialize(layers, optimizer, cb) {
		this._postMessage(
			{
				mode: 'init',
				layers: layers,
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

export default class VAE {
	// https://tips-memo.com/vae-pytorch
	// https://nzw0301.github.io/assets/pdf/vae.pdf
	constructor() {
		this._model = new VAEWorker()

		this._decodeNetId = null
		this._aeNetId = null
	}

	get epoch() {
		return this._epoch
	}

	init(in_size, noise_dim, enc_layers, dec_layers, optimizer, class_size, type) {
		if (this._decodeNetId) {
			this._model.remove(this._decodeNetId)
			this._model.remove(this._aeNetId)
		}
		this._type = type
		this._reconstruct_rate = 10

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
		this._model.initialize(decodeLayers, optimizer, e => {
			this._decodeNetId = e.data
			aeLayers.push(
				{ type: 'include', id: this._decodeNetId, input_to: 'dec_in', train: true },
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
			this._model.initialize(aeLayers, optimizer, e => {
				this._aeNetId = e.data
			})
		})
	}

	terminate() {
		this._model.terminate()
	}

	fit(x, y, iteration, rate, batch, cb) {
		this._model.fit(this._aeNetId, { enc_in: x, cond: y }, x, iteration, rate, batch, e => {
			this._epoch = e.data.epoch
			cb && cb()
		})
	}

	predict(x, y, out, cb) {
		this._model.predict(this._aeNetId, { enc_in: x, cond: y }, out, cb)
	}
}
