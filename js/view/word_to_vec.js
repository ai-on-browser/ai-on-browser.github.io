import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class W2VWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/model_worker.js', { type: 'module' })
	}

	initialize(method, n, wordsOrNumber, reduce_size, optimizer) {
		return this._postMessage({
			name: 'word_to_vec',
			method: 'constructor',
			arguments: [method, n, wordsOrNumber, reduce_size, optimizer],
		})
	}

	epoch() {
		return this._postMessage({ name: 'word_to_vec', method: 'epoch' }).then(r => r.data)
	}

	fit(words, iteration, rate, batch) {
		return this._postMessage({
			name: 'word_to_vec',
			method: 'fit',
			arguments: [words, iteration, rate, batch],
		}).then(r => r.data)
	}

	predict(x) {
		return this._postMessage({ name: 'word_to_vec', method: 'predict', arguments: [x] }).then(r => r.data)
	}

	reduce(x) {
		return this._postMessage({ name: 'word_to_vec', method: 'reduce', arguments: [x] }).then(r => r.data)
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
	const fitModel = async () => {
		const loss = await model.fit(platform.trainInput, +iteration.value, rate.value, batch.value)
		epoch = await model.epoch()
		platform.plotLoss(loss)
		platform.testResult(await model.reduce(platform.testInput()))
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

	return () => {
		model.terminate()
	}
}
