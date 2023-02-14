import NeuralNetworkBuilder from '../neuralnetwork_builder.js'
import Controller from '../controller.js'
import { BaseWorker } from '../utils.js'

class VAEWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/vae_worker.js', { type: 'module' })
	}

	initialize(in_size, noise_dim, enc_layers, dec_layers, optimizer, class_size, type) {
		this._postMessage({ mode: 'init', in_size, noise_dim, enc_layers, dec_layers, optimizer, class_size, type })
		this._type = type
	}

	fit(x, y, iteration, rate, batch) {
		return this._postMessage({ mode: 'fit', x, y, iteration, rate, batch })
	}

	predict(x, y) {
		return this._postMessage({ mode: 'predict', x, y })
	}

	reduce(x, y) {
		return this._postMessage({ mode: 'reduce', x, y })
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

	const fitModel = async cb => {
		if (platform.datas.length === 0) {
			cb && cb()
			return
		}

		const e = await model.fit(platform.trainInput, platform.trainOutput, +iteration.value, rate.value, batch.value)
		epoch = e.data.epoch
		platform.plotLoss(e.data.loss)
		if (mode === 'DR') {
			const e = await model.reduce(platform.trainInput, platform.trainOutput)
			const data = e.data.mean
			platform.trainResult = data
		} else if (mode === 'GR') {
			const e = await model.predict(platform.trainInput, platform.trainOutput)
			const data = e.data
			if (model._type === 'conditional') {
				platform.trainResult = [data, platform.trainOutput]
			} else {
				platform.trainResult = data
			}
		}
		cb && cb()
	}

	const genValues = async () => {
		const e = await model.predict(platform.trainInput, platform.trainOutput)
		const data = e.data
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
	builder.makeHtml(platform.setting.ml.configElement, { optimizer: true })
	const slbConf = controller.stepLoopButtons().init(() => {
		if (platform.datas.length === 0) {
			return
		}
		const class_size = new Set(platform.trainOutput.map(v => v[0])).size
		model.initialize(
			platform.datas.dimension,
			noiseDim?.value ?? platform.dimension,
			builder.layers,
			builder.invlayers,
			builder.optimizer,
			class_size,
			type.value
		)

		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	const rate = controller.input.number({ label: 'Learning rate ', min: 0, max: 100, step: 0.01, value: 0.001 })
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	slbConf.step(fitModel).epoch(() => epoch)
	if (mode === 'GR') {
		controller.input.button('Generate').on('click', genValues)
	}

	platform.setting.terminate = () => {
		model.terminate()
	}
}
