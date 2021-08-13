class AutoEncoderWorker extends BaseWorker {
	constructor() {
		super('model/worker/neuralnetwork_worker.js')
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

	fit(id, train_x, train_y, iteration, rate, batch, options, cb) {
		this._postMessage(
			{
				id: id,
				mode: 'fit',
				x: train_x,
				y: train_y,
				iteration: iteration,
				batch_size: batch,
				rate: rate,
				options: options,
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

export default class Autoencoder {
	constructor() {
		this._model = new AutoEncoderWorker()
	}

	get epoch() {
		return this._epoch
	}

	terminate() {
		this._model.terminate()
	}

	initialize(input_size, reduce_size, enc_layers, dec_layers, optimizer) {
		if (this._id) {
			this._model.remove(this._id)
		}
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

		this._model.initialize(this._layers, optimizer, e => {
			this._id = e.data
		})
	}

	terminate() {
		this._model.remove(this._id)
		this._model.terminate()
	}

	fit(train_x, train_y, iteration, rate, batch, rho, cb) {
		this._model.fit(this._id, train_x, train_y, iteration, rate, batch, { rho: rho }, e => {
			this._epoch = e.data.epoch
			cb && cb(e)
		})
	}

	predict(x, cb) {
		this._model.predict(this._id, x, null, cb)
	}

	reduce(x, cb) {
		this._model.predict(this._id, x, ['reduce'], e => {
			cb && cb(e.data['reduce'])
		})
	}
}
