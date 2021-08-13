class MLPWorker extends BaseWorker {
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

	predict(id, x, cb) {
		this._postMessage(
			{
				id: id,
				mode: 'predict',
				x: x,
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

export default class MLP {
	constructor() {
		this._model = new MLPWorker()
	}

	get type() {
		return this._type
	}

	get output_size() {
		return this._output_size
	}

	get epoch() {
		return this._epoch
	}

	initialize(input_size, output_size, layers, optimizer) {
		if (this._id) {
			this._model.remove(this._id)
		}
		this._type = output_size ? 'classifier' : 'regression'
		this._output_size = output_size
		this._layers = [{ type: 'input' }]
		this._layers.push(...layers)
		this._layers.push({
			type: 'full',
			out_size: output_size || 1,
		})
		if (output_size) {
			this._layers.push({
				type: 'sigmoid',
			})
		}

		this._model.initialize(this._layers, optimizer, e => {
			this._id = e.data
		})
	}

	terminate() {
		this._model.remove(this._id)
		this._model.terminate()
	}

	fit(train_x, train_y, iteration, rate, batch, cb) {
		this._model.fit(this._id, train_x, train_y, iteration, rate, batch, e => {
			this._epoch = e.data.epoch
			cb && cb(e)
		})
	}

	predict(x, cb) {
		this._model.predict(this._id, x, cb)
	}
}
