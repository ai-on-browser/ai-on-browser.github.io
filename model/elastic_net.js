export default class ElasticNetWorker extends BaseWorker {
	constructor() {
		super('model/worker/elastic_net_worker.js')
	}

	initialize(lambda = 0.1, alpha = 0.5) {
		this._postMessage({
			mode: 'init',
			lambda: lambda,
			alpha: alpha,
		})
	}

	fit(train_x, train_y, iteration, alpha, cb) {
		this._postMessage(
			{
				mode: 'fit',
				x: train_x,
				y: train_y,
				iteration: iteration,
				alpha: alpha,
			},
			cb
		)
	}

	predict(x, cb) {
		this._postMessage(
			{
				mode: 'predict',
				x: x,
			},
			cb
		)
	}

	importance(cb) {
		this._postMessage(
			{
				mode: 'importance',
			},
			cb
		)
	}
}
