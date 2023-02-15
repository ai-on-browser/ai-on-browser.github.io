import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class W2VWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/word2vec_worker.js', { type: 'module' })
	}

	initialize(method, n, wordsOrNumber, reduce_size, optimizer) {
		return this._postMessage({ mode: 'init', method, n, wordsOrNumber, reduce_size, optimizer })
	}

	fit(words, iteration, rate, batch) {
		return this._postMessage({ mode: 'fit', words, iteration, rate, batch })
	}

	predict(x) {
		return this._postMessage({ mode: 'predict', x: x })
	}

	reduce(x) {
		return this._postMessage({ mode: 'reduce', x: x }).then(r => r.data)
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Word2vec (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Word2vec',
	}
	const controller = new Controller(platform)
	const model = new W2VWorker()
	let epoch = 0
	const fitModel = async cb => {
		const e = await model.fit(platform.trainInput, +iteration.value, rate.value, batch.value)
		epoch = e.data.epoch
		platform.plotLoss(e.data.loss)
		platform.testResult(await model.reduce(platform.testInput()))
		cb && cb()
	}

	const method = controller.select(['CBOW', 'skip-gram'])
	const n = controller.input.number({ label: ' n ', min: 1, max: 10, value: 1 })
	const slbConf = controller.stepLoopButtons().init(done => {
		platform.init()
		if (platform.datas.length === 0) {
			done()
			return
		}
		const rdim = 2

		model.initialize(method.value, n.value, platform.trainInput, rdim, 'adam').then(done)
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	slbConf.step(fitModel).epoch(() => epoch)

	platform.setting.terminate = () => {
		model.terminate()
	}
}
