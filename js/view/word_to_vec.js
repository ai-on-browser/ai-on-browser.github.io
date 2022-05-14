import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class W2VWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/word2vec_worker.js', { type: 'module' })
	}

	initialize(method, n, wordsOrNumber, reduce_size, optimizer, cb) {
		this._postMessage({ mode: 'init', method, n, wordsOrNumber, reduce_size, optimizer }, cb)
	}

	fit(words, iteration, rate, batch, cb) {
		this._postMessage({ mode: 'fit', words, iteration, rate, batch }, cb)
	}

	predict(x, cb) {
		this._postMessage({ mode: 'predict', x: x }, cb)
	}

	reduce(x, cb) {
		this._postMessage({ mode: 'reduce', x: x }, r => cb(r.data))
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const model = new W2VWorker()
	let epoch = 0
	const fitModel = cb => {
		model.fit(platform.trainInput, +iteration.value, rate.value, batch.value, e => {
			epoch = e.data.epoch
			platform.plotLoss(e.data.loss)
			model.reduce(platform.testInput(), e => {
				platform.testResult(e)
				cb && cb()
			})
		})
	}

	const method = controller.select(['CBOW', 'skip-gram'])
	const n = controller.input.number({ label: ' n ', min: 1, max: 10, value: 1 })
	const slbConf = controller.stepLoopButtons().init(() => {
		platform.init()
		if (platform.datas.length === 0) {
			return
		}
		const rdim = 2

		model.initialize(method.value, n.value, platform.trainInput, rdim, 'adam')
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	slbConf.step(fitModel).epoch(() => epoch)

	platform.setting.terminate = () => {
		model.terminate()
	}
}
