import NeuralNetworkBuilder from '../neuralnetwork_builder.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class NNWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/model_worker.js', { type: 'module' })
	}

	initialize(layers, loss, optimizer) {
		return this._postMessage({
			name: 'neuralnetwork',
			method: 'fromObject',
			static: true,
			initialize: true,
			arguments: [layers, loss, optimizer],
		})
	}

	fit(train_x, train_y, iteration, rate, batch) {
		return this._postMessage({
			name: 'neuralnetwork',
			method: 'fit',
			arguments: [train_x, train_y, iteration, rate, batch],
		})
	}

	predict(x) {
		return this._postMessage({ name: 'neuralnetwork', method: 'calc', arguments: [x] })
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

	const fitModel = async () => {
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
		await model.fit(tx, ty, +iteration.value, rate.value, batch.value)
		epoch += +iteration.value
		if (mode === 'TP') {
			let lx = x.slice(x.rows - dim).value
			const p = []
			while (true) {
				if (p.length >= predCount.value) {
					platform.trainResult = p
					return
				}
				const e = await model.predict([lx])
				p.push(e.data[0])
				lx = lx.slice(x.cols)
				lx.push(...e.data[0])
			}
		} else {
			const e = await model.predict(platform.testInput(dim === 1 ? 2 : 4))
			const data = mode === 'CF' ? Matrix.fromArray(e.data).argmax(1).value : e.data
			platform.testResult(data)
		}
	}

	const getInputDim = () => {
		return mode === 'TP' ? width.value : platform.datas.dimension || 2
	}

	let width = null
	if (mode === 'TP') {
		width = controller.input.number({ label: 'window width', min: 1, max: 1000, value: 20 })
	}
	controller.text(' Hidden Layers ')
	builder.makeHtml(controller, { optimizer: true })
	const slbConf = controller.stepLoopButtons().init(done => {
		if (platform.datas.length === 0) {
			done()
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
		model.initialize(layers, 'mse', optimizer).then(done)
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

	return () => {
		model.terminate()
	}
}
