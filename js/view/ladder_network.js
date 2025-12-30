import * as opt from '../../lib/model/nns/optimizer.js'
import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class LadderNetworkWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/model_worker.js', { type: 'module' })
	}

	initialize(hidden_sizes, lambdas, activation, optimizer) {
		return this._postMessage({
			name: 'ladder_network',
			method: 'constructor',
			arguments: [hidden_sizes, lambdas, activation, optimizer],
		})
	}

	epoch() {
		return this._postMessage({ name: 'ladder_network', method: 'epoch' }).then(r => r.data)
	}

	fit(train_x, train_y, iteration, rate, batch) {
		return this._postMessage({
			name: 'ladder_network',
			method: 'fit',
			arguments: [train_x, train_y, iteration, rate, batch],
		}).then(r => r.data)
	}

	predict(x) {
		return this._postMessage({ name: 'ladder_network', method: 'predict', arguments: [x] }).then(r => r.data)
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ml.reference = {
		author: 'H. Valpola',
		title: 'From Neural PCA to Deep Unsupervised Learning',
		year: 2015,
	}
	const controller = new Controller(platform)
	const model = new LadderNetworkWorker()
	const hidden_sizes = [10]
	let epoch = 0

	const fitModel = async () => {
		const dim = platform.datas.dimension

		const ty = platform.trainOutput.map(v => v[0])
		const loss = await model.fit(platform.trainInput, ty, +iteration.value, rate.value, batch.value)
		epoch = await model.epoch()
		platform.plotLoss({ labeled: loss.labeledLoss, unlabeled: loss.unlabeledLoss })
		const data = await model.predict(platform.testInput(dim === 1 ? 2 : 4))
		platform.testResult(data)
	}

	controller.text(' Hidden Layers ')

	const hsElm = controller.span()
	const createHsElms = () => {
		hsElm.element.replaceChildren()
		for (let i = 0; i < hidden_sizes.length; i++) {
			const hsi = hsElm.input.number({ min: 1, max: 100, value: hidden_sizes[i] }).on('change', () => {
				hidden_sizes[i] = hsi.value
			})
		}
		if (hidden_sizes.length > 0) {
			hsElm.input.button('-').on('click', () => {
				hidden_sizes.pop()
				createHsElms()
			})
		}
	}
	controller.input.button('+').on('click', () => {
		hidden_sizes.push(10)
		createHsElms()
	})
	createHsElms()
	const activation = controller.select({
		label: ' Activation ',
		values: [
			'sigmoid',
			'tanh',
			'relu',
			'elu',
			'leaky_relu',
			'rrelu',
			'prelu',
			'gaussian',
			'softplus',
			'softsign',
			'identity',
		],
	})

	const optimizer = controller.select({
		label: ' Optimizer ',
		values: Object.keys(opt),
		value: 'adam',
	})
	const slbConf = controller.stepLoopButtons().init(done => {
		if (platform.datas.length === 0) {
			done()
			return
		}

		const lambdas = Array(hidden_sizes.length + 2).fill(0.001)

		model.initialize(hidden_sizes, lambdas, activation.value, optimizer.value).then(done)
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 1000, value: 1000 })
	slbConf.step(fitModel).epoch(() => epoch)

	return () => {
		model.terminate()
	}
}
