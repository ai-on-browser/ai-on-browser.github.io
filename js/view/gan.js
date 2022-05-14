import NeuralNetworkBuilder from '../neuralnetwork_builder.js'
import Controller from '../controller.js'
import { BaseWorker, specialCategory } from '../utils.js'

class GANWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/gan_worker.js', { type: 'module' })
	}

	initialize(noise_dim, g_hidden, d_hidden, g_opt, d_opt, class_size, type, cb) {
		this._postMessage({ mode: 'init', noise_dim, g_hidden, d_hidden, g_opt, d_opt, class_size, type }, cb)
		this._type = type
	}

	fit(train_x, train_y, iteration, gen_rate, dis_rate, batch, cb) {
		this._postMessage({ mode: 'fit', x: train_x, y: train_y, iteration, gen_rate, dis_rate, batch }, r =>
			cb(r.data)
		)
	}

	prob(x, y, cb) {
		this._postMessage({ mode: 'prob', x: x, y: y }, r => cb(r.data))
	}

	generate(n, y, cb) {
		this._postMessage({ mode: 'generate', n: n, y: y }, r => cb(r.data))
	}
}

export default function (platform) {
	const elm = platform.setting.ml.configElement
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const gbuilder = new NeuralNetworkBuilder()
	const dbuilder = new NeuralNetworkBuilder()
	const model = new GANWorker()
	let epoch = 0

	const fitModel = cb => {
		if (platform.datas.length === 0) {
			cb && cb()
			return
		}
		const gen_rate = +elm.select('[name=gen_rate]').property('value')
		const dis_rate = +elm.select('[name=dis_rate]').property('value')

		const tx = platform.trainInput
		const ty = platform.trainOutput
		model.fit(tx, ty, +iteration.value, gen_rate, dis_rate, batch.value, fit_data => {
			epoch = fit_data.epoch
			platform.plotLoss({ generator: fit_data.generatorLoss, discriminator: fit_data.discriminatorLoss })
			if (platform.task === 'GR') {
				model.generate(tx.length, ty, gen_data => {
					if (model._type === 'conditional') {
						platform.trainResult = [gen_data, ty]
						cb && cb()
					} else {
						model.prob(platform.testInput(5), null, pred_data => {
							platform.testResult(pred_data.map(v => specialCategory.errorRate(v[1])))
							platform.trainResult = gen_data
							cb && cb()
						})
					}
				})
			} else {
				const x = tx.concat(platform.testInput(5))
				model.prob(x, null, pred_data => {
					const tx_p = pred_data.slice(0, tx.length)
					const px_p = pred_data.slice(tx.length)
					platform.trainResult = tx_p.map(v => v[1] > threshold.value)
					platform.testResult(px_p.map(v => v[1] > threshold.value))
					cb && cb()
				})
			}
		})
	}

	const genValues = () => {
		const ty = platform.trainOutput
		model.generate(platform.trainInput.length, ty, gen_data => {
			if (type.value === 'conditional') {
				platform.trainResult = [gen_data, ty]
			} else {
				platform.trainResult = gen_data
			}
		})
	}

	let type
	if (platform.task === 'GR') {
		type = controller.select(['default', 'conditional'])
	} else {
		type = controller.input({ type: 'hidden', value: 'default' })
	}
	const noiseDim = controller.input.number({ label: 'Noise dim', min: 1, max: 100, value: 5 })
	controller.text('Hidden size ')
	const ganHiddensDiv = elm.append('div').style('display', 'inline-block')
	const gHiddensDiv = ganHiddensDiv.append('div')
	gHiddensDiv.append('span').text('G')
	gbuilder.makeHtml(gHiddensDiv, { optimizer: true })
	const dHiddensDiv = ganHiddensDiv.append('div')
	dHiddensDiv.append('span').text('D')
	dbuilder.makeHtml(dHiddensDiv, { optimizer: true })
	const slbConf = controller.stepLoopButtons().init(() => {
		const g_hidden = gbuilder.layers
		const d_hidden = dbuilder.layers
		const g_opt = gbuilder.optimizer
		const d_opt = dbuilder.optimizer
		const class_size = new Set(platform.trainOutput.map(v => v[0])).size
		model.initialize(noiseDim.value, g_hidden, d_hidden, g_opt, d_opt, class_size, type.value)

		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	controller.text('Learning rate ')
	const ganRatesDiv = elm.append('div').style('display', 'inline-block')
	for (const v of [
		{ name: 'gen_rate', title: 'G', value: 0.01 },
		{ name: 'dis_rate', title: 'D', value: 0.5 },
	]) {
		const grd = ganRatesDiv.append('div')
		grd.append('span').text(v.title)
		grd.append('input')
			.attr('type', 'number')
			.attr('name', v.name)
			.attr('min', 0)
			.attr('max', 100)
			.attr('step', 0.01)
			.attr('value', v.value)
	}
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	let threshold = null
	if (platform.task === 'AD') {
		threshold = controller.input.number({ label: ' threshold = ', min: 0, max: 10, step: 0.01, value: 0.8 })
	}
	slbConf.step(fitModel).epoch(() => epoch)
	if (platform.task === 'GR') {
		controller.input.button('Generate').on('click', genValues)
	}

	platform.setting.terminate = () => {
		model.terminate()
	}
}
