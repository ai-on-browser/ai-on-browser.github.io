class LadderNetworkWorker extends BaseWorker {
	constructor() {
		super('js/view/worker/ladder_network_worker.js', { type: 'module' })
	}

	initialize(hidden_sizes, lambdas, activation, optimizer, cb) {
		this._postMessage({ mode: 'init', hidden_sizes, lambdas, activation, optimizer }, cb)
	}

	fit(train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage({ mode: 'fit', x: train_x, y: train_y, iteration, rate, batch }, cb)
	}

	predict(x, cb) {
		this._postMessage({ mode: 'predict', x: x }, cb)
	}
}

var dispLadder = function (elm, platform) {
	const model = new LadderNetworkWorker()
	const hidden_sizes = [10]
	let epoch = 0

	const fitModel = cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const dim = platform.datas.dimension

		platform.fit((tx, ty, pred_cb) => {
			ty = ty.map(v => v[0])
			model.fit(tx, ty, iteration, rate, batch, e => {
				epoch = e.data.epoch
				platform.predict(
					(px, pred_cb) => {
						model.predict(px, e => {
							const data = e.data
							pred_cb(data)

							cb && cb()
						})
					},
					dim === 1 ? 2 : 4
				)
			})
		})
	}

	elm.append('span').text(' Hidden Layers ')

	const hsElm = elm.append('span')
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
	elm.append('input')
		.attr('type', 'button')
		.attr('value', '+')
		.on('click', () => {
			hidden_sizes.push(10)
			createHsElms()
		})
	createHsElms()
	elm.append('span').text(' Activation ')
	elm.append('select')
		.attr('name', 'activation')
		.selectAll('option')
		.data([
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
		])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)

	elm.append('span').text(' Optimizer ')
	elm.append('select')
		.attr('name', 'optimizer')
		.selectAll('option')
		.data(['sgd', 'adam', 'momentum', 'rmsprop'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		if (platform.datas.length === 0) {
			return
		}

		const activation = elm.select('[name=activation]').property('value')
		const optimizer = elm.select('[name=optimizer]').property('value')
		const lambdas = Array(hidden_sizes.length + 2).fill(0.001)

		model.initialize(hidden_sizes, lambdas, activation, optimizer)
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
	elm.append('span').text(' Learning rate ')
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
		.attr('value', 1000)
		.attr('min', 1)
		.attr('max', 1000)
		.attr('step', 1)
	slbConf.step(fitModel).epoch(() => epoch)

	return () => {
		model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ternimate = dispLadder(platform.setting.ml.configElement, platform)
}
