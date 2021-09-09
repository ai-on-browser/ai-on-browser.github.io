import { Matrix } from '../js/math.js'

import MLP from '../model/mlp.js'

var dispMLP = function (elm, platform) {
	const mode = platform.task
	let model = null
	const builder = new NeuralNetworkBuilder()

	const fitModel = cb => {
		if (!model) {
			cb && cb()
			return
		}
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
					tx.push(x.sliceRow(i, i + dim).value)
				}
			} else if (model.output_size) {
				const y = Matrix.zeros(ty.length, model.output_size)
				ty.forEach((t, i) => y.set(i, t[0], 1))
				ty = y.toArray()
			}
			model.fit(tx, ty, iteration, rate, batch, e => {
				if (mode === 'TP') {
					let lx = x.sliceRow(x.rows - dim).value
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
								const data = mode == 'CF' ? Matrix.fromArray(e.data).argmax(1).value : e.data
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
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		if (platform.datas.length == 0) {
			return
		}
		if (!model) model = new MLP()

		const dim = getInputDim()
		const optimizer = builder.optimizer

		let model_classes = mode == 'CF' ? Math.max.apply(null, platform.datas.y) + 1 : 0
		model.initialize(dim, model_classes, builder.layers, optimizer)
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
	slbConf.step(fitModel).epoch(() => model.epoch)
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
		model && model.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ternimate = dispMLP(platform.setting.ml.configElement, platform)
}
