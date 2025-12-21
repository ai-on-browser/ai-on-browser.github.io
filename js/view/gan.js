import Controller from '../controller.js'
import NeuralNetworkBuilder from '../neuralnetwork_builder.js'
import { BaseWorker, specialCategory } from '../utils.js'

class GANWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/model_worker.js', { type: 'module' })
	}

	initialize(noise_dim, g_hidden, d_hidden, g_opt, d_opt, class_size, type) {
		this._type = type
		return this._postMessage({
			name: 'gan',
			method: 'constructor',
			arguments: [noise_dim, g_hidden, d_hidden, g_opt, d_opt, class_size, type],
		})
	}

	epoch() {
		return this._postMessage({ name: 'gan', method: 'epoch' }).then(r => r.data)
	}

	fit(train_x, train_y, iteration, gen_rate, dis_rate, batch) {
		return this._postMessage({
			name: 'gan',
			method: 'fit',
			arguments: [train_x, train_y, iteration, gen_rate, dis_rate, batch],
		}).then(r => r.data)
	}

	prob(x, y) {
		return this._postMessage({ name: 'gan', method: 'prob', arguments: [x, y] }).then(r => r.data)
	}

	generate(n, y) {
		return this._postMessage({ name: 'gan', method: 'generate', arguments: [n, y] }).then(r => r.data)
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const gbuilder = new NeuralNetworkBuilder()
	const dbuilder = new NeuralNetworkBuilder()
	const model = new GANWorker()
	let epoch = 0

	const fitModel = async () => {
		if (platform.datas.length === 0) {
			return
		}
		const gen_rate = rateElms.gen_rate.value
		const dis_rate = rateElms.dis_rate.value

		const tx = platform.trainInput
		const ty = platform.trainOutput
		const loss = await model.fit(tx, ty, +iteration.value, gen_rate, dis_rate, batch.value)
		epoch = await model.epoch()
		platform.plotLoss({ generator: loss.generatorLoss, discriminator: loss.discriminatorLoss })
		if (platform.task === 'GR') {
			const gen_data = await model.generate(tx.length, ty)
			if (model._type === 'conditional') {
				platform.trainResult = [gen_data, ty]
			} else {
				const pred_data = await model.prob(platform.testInput(5))
				platform.testResult(pred_data.map(v => specialCategory.errorRate(v[1])))
				platform.trainResult = gen_data
			}
		} else {
			const x = tx.concat(platform.testInput(5))
			const pred_data = await model.prob(x)
			const tx_p = pred_data.slice(0, tx.length)
			const px_p = pred_data.slice(tx.length)
			platform.trainResult = tx_p.map(v => v[1] > threshold.value)
			platform.testResult(px_p.map(v => v[1] > threshold.value))
		}
	}

	const genValues = async () => {
		const ty = platform.trainOutput
		const gen_data = await model.generate(platform.trainInput.length, ty)
		if (type.value === 'conditional') {
			platform.trainResult = [gen_data, ty]
		} else {
			platform.trainResult = gen_data
		}
	}

	let type
	if (platform.task === 'GR') {
		type = controller.select(['default', 'conditional'])
	} else {
		type = controller.input({ type: 'hidden', value: 'default' })
	}
	const noiseDim = controller.input.number({ label: 'Noise dim', min: 1, max: 100, value: 5 })
	controller.text('Hidden size ')
	const ganHiddensDiv = controller.div()
	ganHiddensDiv.element.style.display = 'inline-block'
	const gHiddensDiv = ganHiddensDiv.div()
	gHiddensDiv.text('G')
	gbuilder.makeHtml(gHiddensDiv, { optimizer: true })
	const dHiddensDiv = ganHiddensDiv.div()
	dHiddensDiv.text('D')
	dbuilder.makeHtml(dHiddensDiv, { optimizer: true })
	const slbConf = controller.stepLoopButtons().init(done => {
		const g_hidden = gbuilder.layers
		const d_hidden = dbuilder.layers
		const g_opt = gbuilder.optimizer
		const d_opt = dbuilder.optimizer
		const class_size = new Set(platform.trainOutput.map(v => v[0])).size
		model.initialize(noiseDim.value, g_hidden, d_hidden, g_opt, d_opt, class_size, type.value).then(done)

		platform.init()
	})
	const iteration = controller.select({ label: ' Iteration ', values: [1, 10, 100, 1000, 10000] })
	controller.text('Learning rate ')
	const ganRatesDiv = controller.div()
	ganRatesDiv.element.style.display = 'inline-block'
	const rateElms = {}
	for (const v of [
		{ name: 'gen_rate', title: 'G', value: 0.01 },
		{ name: 'dis_rate', title: 'D', value: 0.5 },
	]) {
		const grd = ganRatesDiv.div()
		rateElms[v.name] = grd.input.number({
			label: v.title,
			name: v.name,
			min: 0,
			max: 100,
			step: 0.01,
			value: v.value,
		})
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

	return () => {
		model.terminate()
	}
}
