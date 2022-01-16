import NeuralNetworkBuilder from '../neuralnetwork_builder.js'

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

var dispGAN = function (elm, platform) {
	const gbuilder = new NeuralNetworkBuilder()
	const dbuilder = new NeuralNetworkBuilder()
	const model = new GANWorker()
	let epoch = 0

	const fitModel = cb => {
		if (platform.datas.length === 0) {
			cb && cb()
			return
		}
		const iteration = +elm.select('[name=iteration]').property('value')
		const gen_rate = +elm.select('[name=gen_rate]').property('value')
		const dis_rate = +elm.select('[name=dis_rate]').property('value')
		const batch = +elm.select('[name=batch]').property('value')

		platform.fit((tx, ty, pred_cb) => {
			model.fit(tx, ty, iteration, gen_rate, dis_rate, batch, fit_data => {
				const gen_data = fit_data.gen_data
				epoch = fit_data.epoch
				if (platform.task === 'GR') {
					if (model._type === 'conditional') {
						pred_cb(gen_data, ty)
						cb && cb()
					} else {
						platform.predict((px, tile_cb) => {
							model.prob(px, null, pred_data => {
								tile_cb(pred_data.map(v => specialCategory.errorRate(v[1])))
								pred_cb(gen_data)
								cb && cb()
							})
						}, 5)
					}
				} else {
					const th = +elm.select('[name=threshold]').property('value')
					platform.predict((px, tile_cb) => {
						const x = tx.concat(px)
						model.prob(x, null, pred_data => {
							const tx_p = pred_data.slice(0, tx.length)
							const px_p = pred_data.slice(tx.length)
							pred_cb(tx_p.map(v => v[1] > th))
							tile_cb(px_p.map(v => v[1] > th))
							cb && cb()
						})
					}, 5)
				}
			})
		})
	}

	const genValues = cb => {
		platform.fit((tx, ty, pred_cb) => {
			model.generate(tx.length, ty, gen_data => {
				const type = elm.select('[name=type]').property('value')
				if (type === 'conditional') {
					pred_cb(gen_data, ty)
				} else {
					pred_cb(gen_data)
				}
				cb && cb()
			})
		})
	}

	if (platform.task === 'GR') {
		elm.append('select')
			.attr('name', 'type')
			.selectAll('option')
			.data(['default', 'conditional'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
	} else {
		elm.append('input').attr('name', 'type').attr('type', 'hidden').attr('value', 'default')
	}
	elm.append('span').text('Noise dim')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'noise_dim')
		.attr('min', 1)
		.attr('max', 100)
		.attr('value', 5)
	elm.append('span').text('Hidden size ')
	const ganHiddensDiv = elm.append('div').style('display', 'inline-block')
	const gHiddensDiv = ganHiddensDiv.append('div')
	gHiddensDiv.append('span').text('G')
	gbuilder.makeHtml(gHiddensDiv, { optimizer: true })
	const dHiddensDiv = ganHiddensDiv.append('div')
	dHiddensDiv.append('span').text('D')
	dbuilder.makeHtml(dHiddensDiv, { optimizer: true })
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		const noise_dim = +elm.select('[name=noise_dim]').property('value')
		const g_hidden = gbuilder.layers
		const d_hidden = dbuilder.layers
		const g_opt = gbuilder.optimizer
		const d_opt = dbuilder.optimizer
		const type = elm.select('[name=type]').property('value')
		const class_size = platform.datas.categories.length
		model.initialize(noise_dim, g_hidden, d_hidden, g_opt, d_opt, class_size, type)

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
	const ganRatesDiv = elm.append('div').style('display', 'inline-block')
	for (const v of [
		{ name: 'gen_rate', title: 'G', value: 0.01 },
		{ name: 'dis_rate', title: 'D', value: 0.5 },
	]) {
		const grd = ganRatesDiv.append('div')
		grd.append('span').text(v.title)
		elm.append('input')
			.attr('type', 'number')
			.attr('name', v.name)
			.attr('min', 0)
			.attr('max', 100)
			.attr('step', 0.01)
			.attr('value', v.value)
	}
	elm.append('span').text(' Batch size ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'batch')
		.attr('value', 10)
		.attr('min', 1)
		.attr('max', 100)
		.attr('step', 1)
	if (platform.task === 'AD') {
		elm.append('span').text(' threshold = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'threshold')
			.attr('value', 0.8)
			.attr('min', 0)
			.attr('max', 10)
			.attr('step', 0.01)
	}
	slbConf.step(fitModel).epoch(() => epoch)
	if (platform.task === 'GR') {
		elm.append('input').attr('type', 'button').attr('value', 'Generate').on('click', genValues)
	}

	return () => {
		model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispGAN(platform.setting.ml.configElement, platform)
}
