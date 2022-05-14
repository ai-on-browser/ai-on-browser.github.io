import NeuralNetworkBuilder from '../neuralnetwork_builder.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class NNWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/neuralnetwork_worker.js', { type: 'module' })
	}

	initialize(layers, loss, optimizer, cb) {
		this._postMessage({ mode: 'init', layers, loss, optimizer }, cb)
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
	const model = new NNWorker()
	const builder = new NeuralNetworkBuilder()
	let epoch = 0

	let output_size = 0

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
		} else if (mode === 'CF') {
			for (let i = 0; i < ty.length; i++) {
				const yi = Array(output_size).fill(0)
				yi[ty[i]] = 1
				ty[i] = yi
			}
		}
		model.fit(tx, ty, +iteration.value, rate.value, batch.value, e => {
			epoch += +iteration.value
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
					const data = mode === 'CF' ? Matrix.fromArray(e.data).argmax(1).value : e.data
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
	builder.makeHtml(platform.setting.ml.configElement, { optimizer: true })
	const slbConf = controller.stepLoopButtons().init(() => {
		if (platform.datas.length === 0) {
			return
		}

		const optimizer = builder.optimizer

		output_size =
			mode === 'CF' ? Math.max.apply(null, platform.datas.y) + 1 : mode === 'TP' ? platform.datas.dimension : 1
		const layers = [{ type: 'input' }]
		layers.push(...builder.layers)
		layers.push({ type: 'full', out_size: output_size })
		if (mode === 'CF') {
			layers.push({ type: 'sigmoid' })
		}
		model.initialize(layers, 'mse', optimizer)
		platform.init()
		epoch = 0
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
