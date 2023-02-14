import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class LadderNetworkWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/ladder_network_worker.js', { type: 'module' })
	}

	initialize(hidden_sizes, lambdas, activation, optimizer) {
		this._postMessage({ mode: 'init', hidden_sizes, lambdas, activation, optimizer })
	}

	fit(train_x, train_y, iteration, rate, batch) {
		return this._postMessage({ mode: 'fit', x: train_x, y: train_y, iteration, rate, batch })
	}

	predict(x) {
		return this._postMessage({ mode: 'predict', x: x })
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

	const fitModel = async cb => {
		const dim = platform.datas.dimension

		const ty = platform.trainOutput.map(v => v[0])
		const e = await model.fit(platform.trainInput, ty, +iteration.value, rate.value, batch.value)
		epoch = e.data.epoch
		platform.plotLoss({ labeled: e.data.labeledLoss, unlabeled: e.data.unlabeledLoss })
		const pred_e = await model.predict(platform.testInput(dim === 1 ? 2 : 4))
		const data = pred_e.data
		platform.testResult(data)

		cb && cb()
	}

	controller.text(' Hidden Layers ')

	const hsElm = platform.setting.ml.configElement.append('span')
	const createHsElms = () => {
		hsElm.selectAll('*').remove()
		for (let i = 0; i < hidden_sizes.length; i++) {
			const hsi = hsElm
				.append('input')
				.attr('type', 'number')
				.attr('min', 1)
				.attr('max', 100)
				.attr('value', hidden_sizes[i])
				.on('change', () => {
					hidden_sizes[i] = +hsi.property('value')
				})
		}
		if (hidden_sizes.length > 0) {
			hsElm
				.append('input')
				.attr('type', 'button')
				.attr('value', '-')
				.on('click', () => {
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

	const optimizer = controller.select({ label: ' Optimizer ', values: ['sgd', 'adam', 'momentum', 'rmsprop'] })
	const slbConf = controller.stepLoopButtons().init(() => {
		if (platform.datas.length === 0) {
			return
		}

		const lambdas = Array(hidden_sizes.length + 2).fill(0.001)

		model.initialize(hidden_sizes, lambdas, activation.value, optimizer.value)
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 1000, value: 1000 })
	slbConf.step(fitModel).epoch(() => epoch)

	platform.setting.ternimate = () => {
		model.terminate()
	}
}
