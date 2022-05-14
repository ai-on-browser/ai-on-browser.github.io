import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class RNNWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/rnn_worker.js', { type: 'module' })
	}

	initialize(method, window, unit, out_size, optimizer, cb) {
		this._postMessage({ mode: 'init', method, window, unit, out_size, optimizer }, cb)
	}

	fit(train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage({ mode: 'fit', x: train_x, y: train_y, iteration, rate, batch }, cb)
	}

	predict(x, k, cb) {
		this._postMessage({ mode: 'predict', x, k }, cb)
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const model = new RNNWorker()
	let epoch = 0

	const fitModel = cb => {
		model.fit(platform.trainInput, platform.trainInput, +iteration.value, rate.value, batch.value, e => {
			epoch = e.data.epoch
			platform.plotLoss(e.data.loss)
			model.predict(platform.trainInput, predCount.value, e => {
				const pred = e.data
				platform.trainResult = pred
				cb && cb()
			})
		})
	}

	const method = controller.select(['rnn', 'LSTM', 'GRU'])
	const window = controller.input.number({ label: 'window width', min: 1, max: 1000, value: 30 })
	const slbConf = controller.stepLoopButtons().init(() => {
		if (platform.datas.length === 0) {
			return
		}

		model.initialize(method.value.toLowerCase(), window.value, 3, platform.trainInput[0].length)
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	slbConf.step(fitModel).epoch(() => epoch)
	const predCount = controller.input.number({
		label: ' predict count',
		min: 1,
		max: 1000,
		value: 100,
	})

	platform.setting.ternimate = () => {
		model.terminate()
	}
}
