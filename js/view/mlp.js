import Matrix from '../../lib/util/matrix.js'

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

var dispMLP = function (elm, platform) {
	const mode = platform.task
	const model = new MLPWorker()
	const hidden_sizes = [10]
	let epoch = 0

	const fitModel = cb => {
		const iteration = +elm.select('[name=iteration]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		const rate = +elm.select('[name=rate]').property('value')
		const predCount = +elm.select('[name=pred_count]').property('value')
		const dim = getInputDim()

		platform.fit((tx, ty, pred_cb) => {
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
			model.fit(tx, ty, iteration, rate, batch, e => {
				epoch = e.data.epoch
				if (mode === 'TP') {
					let lx = x.slice(x.rows - dim).value
					const p = []
					const predNext = () => {
						if (p.length >= predCount) {
							pred_cb(p)

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
				}
			})
		})
	}

	const getInputDim = () => {
		return mode === 'TP' ? +elm.select('[name=width]').property('value') : platform.datas.dimension || 2
	}

	if (mode === 'TP') {
		elm.append('span').text('window width')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'width')
			.attr('min', 1)
			.attr('max', 1000)
			.attr('value', 20)
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

		model.initialize(mode === 'CF' ? 'classifier' : 'regressor', hidden_sizes, activation, optimizer)
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
		.attr('value', 10)
		.attr('min', 1)
		.attr('max', 100)
		.attr('step', 1)
	slbConf.step(fitModel).epoch(() => epoch)
	if (mode === 'TP') {
		elm.append('span').text(' predict count')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'pred_count')
			.attr('min', 1)
			.attr('max', 1000)
			.attr('value', 100)
	} else {
		elm.append('input').attr('type', 'hidden').attr('name', 'pred_count').property('value', 0)
	}

	return () => {
		model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ternimate = dispMLP(platform.setting.ml.configElement, platform)
}
