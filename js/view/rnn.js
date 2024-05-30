import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class RNNWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/rnn_worker.js', { type: 'module' })
	}

	initialize(method, window, unit, out_size, optimizer) {
		return this._postMessage({ mode: 'init', method, window, unit, out_size, optimizer })
	}

	fit(train_x, train_y, iteration, rate, batch) {
		return this._postMessage({ mode: 'fit', x: train_x, y: train_y, iteration, rate, batch })
	}

	predict(x, k) {
		return this._postMessage({ mode: 'predict', x, k })
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const model = new RNNWorker()
	let epoch = 0

	const fitModel = async () => {
		const e = await model.fit(platform.trainInput, platform.trainInput, +iteration.value, rate.value, batch.value)
		epoch = e.data.epoch
		platform.plotLoss(e.data.loss)
		const pred_e = await model.predict(platform.trainInput, predCount.value)
		platform.trainResult = pred_e.data
	}

	const method = controller.select(['rnn', 'LSTM', 'GRU'])
	const window = controller.input.number({ label: 'window width', min: 1, max: 1000, value: 30 })
	const slbConf = controller.stepLoopButtons().init(done => {
		if (platform.datas.length === 0) {
			done()
			return
		}

		model.initialize(method.value.toLowerCase(), window.value, 3, platform.trainInput[0].length).then(done)
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	slbConf.step(fitModel).epoch(() => epoch)
	const predCount = controller.input.number({ label: ' predict count', min: 1, max: 1000, value: 100 })

	return () => {
		model.terminate()
	}
}
