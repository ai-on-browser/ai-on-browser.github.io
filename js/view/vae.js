import NeuralNetworkBuilder from '../neuralnetwork_builder.js'
import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class VAEWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/model_worker.js', { type: 'module' })
	}

	initialize(in_size, noise_dim, enc_layers, dec_layers, optimizer, class_size, type) {
		this._type = type
		return this._postMessage({
			name: 'vae',
			method: 'constructor',
			arguments: [in_size, noise_dim, enc_layers, dec_layers, optimizer, class_size, type],
		})
	}

	epoch() {
		return this._postMessage({ name: 'vae', method: 'epoch' }).then(r => r.data)
	}

	fit(x, y, iteration, rate, batch) {
		return this._postMessage({ name: 'vae', method: 'fit', arguments: [x, y, iteration, rate, batch] }).then(
			r => r.data
		)
	}

	predict(x, y) {
		return this._postMessage({ name: 'vae', method: 'predict', arguments: [x, y] }).then(r => r.data)
	}

	reduce(x, y) {
		return this._postMessage({ name: 'vae', method: 'reduce', arguments: [x, y] }).then(r => r.data)
	}
}

export default function (platform) {
	// https://mtkwt.github.io/post/vae/
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const mode = platform.task
	const model = new VAEWorker()
	let epoch = 0

	const fitModel = async () => {
		if (platform.datas.length === 0) {
			return
		}

		const loss = await model.fit(
			platform.trainInput,
			platform.trainOutput,
			+iteration.value,
			rate.value,
			batch.value
		)
		epoch = await model.epoch()
		platform.plotLoss(loss)
		if (mode === 'DR') {
			platform.trainResult = await model.reduce(platform.trainInput, platform.trainOutput)
		} else if (mode === 'GR') {
			const data = await model.predict(platform.trainInput, platform.trainOutput)
			if (model._type === 'conditional') {
				platform.trainResult = [data, platform.trainOutput]
			} else {
				platform.trainResult = data
			}
		}
	}

	const genValues = async () => {
		const data = await model.predict(platform.trainInput, platform.trainOutput)
		if (type.value === 'conditional') {
			platform.trainResult = [data, platform.trainOutput]
		} else {
			platform.trainResult = data
		}
	}

	const type = controller.select(['default', 'conditional'])
	let noiseDim = null
	if (mode !== 'DR') {
		noiseDim = controller.input.number({ label: 'Noise dim', min: 1, max: 100, value: 5 })
	}
	const builder = new NeuralNetworkBuilder()
	builder.makeHtml(controller, { optimizer: true })
	const slbConf = controller.stepLoopButtons().init(done => {
		if (platform.datas.length === 0) {
			done()
			return
		}
		const class_size = new Set(platform.trainOutput.map(v => v[0])).size
		model
			.initialize(
				platform.datas.dimension,
				noiseDim?.value ?? platform.dimension,
				builder.layers,
				builder.invlayers,
				builder.optimizer,
				class_size,
				type.value
			)
			.then(done)

		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: 'Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	slbConf.step(fitModel).epoch(() => epoch)
	if (mode === 'GR') {
		controller.input.button('Generate').on('click', genValues)
	}

	return () => {
		model.terminate()
	}
}
