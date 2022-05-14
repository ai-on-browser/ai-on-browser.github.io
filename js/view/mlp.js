import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class MLPWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/mlp_worker.js', { type: 'module' })
	}

	initialize(type, hidden_sizes, activation, optimizer, cb) {
		this._postMessage({ mode: 'init', type, hidden_sizes, activation, optimizer }, cb)
	}

	fit(train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage({ mode: 'fit', x: train_x, y: train_y, iteration, rate, batch }, cb)
	}

	predict(x, cb) {
		this._postMessage({ mode: 'predict', x: x }, cb)
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const mode = platform.task
	const model = new MLPWorker()
	const hidden_sizes = [10]
	let epoch = 0

	const fitModel = cb => {
		const dim = getInputDim()

		let tx = platform.trainInput
		let ty = platform.trainOutput
		const x = Matrix.fromArray(tx)
		if (mode === 'TP') {
			ty = tx.slice(dim)
			tx = []
			for (let i = 0; i < x.rows - dim; i++) {
				tx.push(x.slice(i, i + dim).value)
			}
		}
		if (mode === 'CF') {
			ty = ty.map(v => v[0])
		}
		model.fit(tx, ty, +iteration.value, rate.value, batch.value, e => {
			epoch = e.data.epoch
			platform.plotLoss(e.data.loss)
			if (mode === 'TP') {
				let lx = x.slice(x.rows - dim).value
				const p = []
				const predNext = () => {
					if (p.length >= predCount.value) {
						platform.trainResult = p

						cb && cb()
						return
					}
					model.predict([lx], e => {
						const d = e.data[0]
						p.push(e.data[0])
						lx = lx.slice(x.cols)
						lx.push(...e.data[0])
						predNext()
					})
				}
				predNext()
			} else {
				model.predict(platform.testInput(dim === 1 ? 2 : 4), e => {
					const data = e.data
					platform.testResult(data)

					cb && cb()
				})
			}
		})
	}

	const getInputDim = () => {
		return mode === 'TP' ? width.value : platform.datas.dimension || 2
	}

	let width = null
	if (mode === 'TP') {
		width = controller.input.number({ label: 'window width', min: 1, max: 1000, value: 20 })
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
			'linear',
		],
	})

	const optimizer = controller.select({ label: ' Optimizer ', values: ['sgd', 'adam', 'momentum', 'rmsprop'] })
	const slbConf = controller.stepLoopButtons().init(() => {
		if (platform.datas.length === 0) {
			return
		}

		model.initialize(mode === 'CF' ? 'classifier' : 'regressor', hidden_sizes, activation.value, optimizer.value)
		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	slbConf.step(fitModel).epoch(() => epoch)
	let predCount
	if (mode === 'TP') {
		predCount = controller.input.number({ label: ' predict count', min: 1, max: 1000, value: 100 })
	} else {
		predCount = controller.input({ type: 'hidden', value: 0 })
	}

	platform.setting.ternimate = () => {
		model.terminate()
	}
}
