import SVM from '../../lib/model/svm.js'
import EnsembleBinaryModel from '../../lib/util/ensemble.js'

var dispSVM = function (elm, platform) {
	const step = 4
	let model = null
	let learn_epoch = 0

	const calcSVM = function (cb) {
		if (platform.datas.length === 0) {
			return
		}
		const iteration = +elm.select('[name=iteration]').property('value')
		platform.fit((tx, ty, fit_cb) => {
			for (let i = 0; i < iteration; i++) {
				model.fit()
			}
			platform.predict((px, pred_cb) => {
				const data = model.predict(px)
				pred_cb(data)
				learn_epoch += iteration
				cb && cb()
			}, step)
		})
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['oneone', 'onerest'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('select')
		.attr('name', 'kernel')
		.on('change', function () {
			const k = d3.select(this).property('value')
			if (k === 'gaussian') {
				elm.select('input[name=gamma]').style('display', 'inline')
			} else {
				elm.select('input[name=gamma]').style('display', 'none')
			}
		})
		.selectAll('option')
		.data(['gaussian', 'linear'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'gamma')
		.attr('value', 1)
		.attr('min', 0.01)
		.attr('max', 10.0)
		.attr('step', 0.01)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		const kernel = elm.select('[name=kernel]').property('value')
		const kernel_args = []
		if (kernel === 'gaussian') {
			kernel_args.push(+elm.select('input[name=gamma]').property('value'))
		}
		const method = elm.select('[name=method]').property('value')
		model = new EnsembleBinaryModel(SVM, method, null, [kernel, kernel_args])
		platform.fit((tx, ty) => {
			model.init(
				tx,
				ty.map(v => v[0])
			)
		})
		learn_epoch = 0
		platform.init()
	})
	elm.append('span').text(' Iteration ')
	elm.append('select')
		.attr('name', 'iteration')
		.selectAll('option')
		.data([1, 10, 100, 1000])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	slbConf.step(calcSVM).epoch(() => learn_epoch)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSVM(platform.setting.ml.configElement, platform)
}