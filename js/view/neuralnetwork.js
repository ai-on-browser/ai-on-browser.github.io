import NeuralNetworkBuilder from '../neuralnetwork_builder.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

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

var dispNN = function (elm, platform) {
	const controller = new Controller(platform)
	const mode = platform.task
	const model = new NNWorker()
	const builder = new NeuralNetworkBuilder()
	let epoch = 0

	let output_size = 0

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
			} else if (mode === 'CF') {
				for (let i = 0; i < ty.length; i++) {
					const yi = Array(output_size).fill(0)
					yi[ty[i]] = 1
					ty[i] = yi
				}
			}
			model.fit(tx, ty, iteration, rate, batch, e => {
				epoch += iteration
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
								const data = mode === 'CF' ? Matrix.fromArray(e.data).argmax(1).value : e.data
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
	builder.makeHtml(elm, { optimizer: true })
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
	platform.setting.ternimate = dispNN(platform.setting.ml.configElement, platform)
}
