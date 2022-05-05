import NeuralNetworkBuilder from '../neuralnetwork_builder.js'
import Controller from '../controller.js'

class VAEWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/vae_worker.js', { type: 'module' })
	}

	initialize(in_size, noise_dim, enc_layers, dec_layers, optimizer, class_size, type, cb) {
		this._postMessage({ mode: 'init', in_size, noise_dim, enc_layers, dec_layers, optimizer, class_size, type }, cb)
		this._type = type
	}

	fit(x, y, iteration, rate, batch, cb) {
		this._postMessage({ mode: 'fit', x, y, iteration, rate, batch }, cb)
	}

	predict(x, y, cb) {
		this._postMessage({ mode: 'predict', x, y }, cb)
	}

	reduce(x, y, cb) {
		this._postMessage({ mode: 'reduce', x, y }, cb)
	}
}

var dispVAE = function (elm, platform) {
	// https://mtkwt.github.io/post/vae/
	const controller = new Controller(platform)
	const mode = platform.task
	const model = new VAEWorker()
	let epoch = 0

	const fitModel = cb => {
		if (platform.datas.length === 0) {
			cb && cb()
			return
		}
		const iteration = +elm.select('[name=iteration]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const batch = +elm.select('[name=batch]').property('value')

		model.fit(platform.trainInput, platform.trainOutput, iteration, rate, batch, e => {
			epoch = e.data.epoch
			platform.plotLoss(e.data.loss)
			if (mode === 'DR') {
				model.reduce(platform.trainInput, platform.trainOutput, e => {
					const data = e.data.mean
					platform.trainResult = data
					cb && cb()
				})
			} else if (mode === 'GR') {
				model.predict(platform.trainInput, platform.trainOutput, e => {
					const data = e.data
					if (model._type === 'conditional') {
						platform.trainResult = [data, platform.trainOutput]
					} else {
						platform.trainResult = data
					}
					cb && cb()
				})
			}
		})
	}

	const genValues = () => {
		model.predict(platform.trainInput, platform.trainOutput, e => {
			const data = e.data
			const type = elm.select('[name=type]').property('value')
			if (type === 'conditional') {
				platform.trainResult = [data, platform.trainOutput]
			} else {
				platform.trainResult = data
			}
		})
	}

	elm.append('select')
		.attr('name', 'type')
		.selectAll('option')
		.data(['default', 'conditional'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	if (mode !== 'DR') {
		elm.append('span').text('Noise dim')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'noise_dim')
			.attr('min', 1)
			.attr('max', 100)
			.attr('value', 5)
	}
	const builder = new NeuralNetworkBuilder()
	builder.makeHtml(elm, { optimizer: true })
	const slbConf = controller.stepLoopButtons().init(() => {
		if (platform.datas.length === 0) {
			return
		}
		const noise_dim = platform.dimension || +elm.select('[name=noise_dim]').property('value')
		const type = elm.select('[name=type]').property('value')
		const class_size = new Set(platform.trainOutput.map(v => v[0])).size
		model.initialize(
			platform.datas.dimension,
			noise_dim,
			builder.layers,
			builder.invlayers,
			builder.optimizer,
			class_size,
			type
		)

		platform.init()
	})
	elm.append('span').text(' Iteration ')
	elm.append('select')
		.attr('name', 'iteration')
		.selectAll('option')
		.data([1, 10, 100, 1000, 10000])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text('Learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'rate')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.01)
		.attr('value', 0.001)
	elm.append('span').text(' Batch size ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'batch')
		.attr('value', 10)
		.attr('min', 1)
		.attr('max', 100)
		.attr('step', 1)
	slbConf.step(fitModel).epoch(() => epoch)
	if (mode === 'GR') {
		elm.append('input').attr('type', 'button').attr('value', 'Generate').on('click', genValues)
	}

	return () => {
		model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispVAE(platform.setting.ml.configElement, platform)
}
