export default class LassoWorker extends BaseWorker {
	constructor() {
		super('model/worker/lasso_worker.js')
	}

	initialize(lambda = 0.1, method = 'CD') {
		this._postMessage({
			mode: 'init',
			lambda: lambda,
			method: method,
		})
	}

	fit(train_x, train_y, iteration, cb) {
		this._postMessage(
			{
				mode: 'fit',
				x: train_x,
				y: train_y,
				iteration: iteration,
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
