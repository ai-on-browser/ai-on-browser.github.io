import SVM from '../../lib/model/svm.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

var dispSVM = function (elm, platform) {
	const controller = new Controller(platform)
	const step = 4
	let model = null
	let learn_epoch = 0

	const calcSVM = function (cb) {
		if (platform.datas.length === 0) {
			return
		}
		const iteration = +elm.select('[name=iteration]').property('value')
		for (let i = 0; i < iteration; i++) {
			model.fit()
		}
		const data = model.predict(platform.testInput(step))
		platform.testResult(data)
		learn_epoch += iteration
		cb && cb()
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['oneone', 'onerest'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.select('[name=method]').property('value', 'onerest')
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
	const slbConf = controller.stepLoopButtons().init(() => {
		const kernel = elm.select('[name=kernel]').property('value')
		const kernel_args = []
		if (kernel === 'gaussian') {
			kernel_args.push(+elm.select('input[name=gamma]').property('value'))
		}
		const method = elm.select('[name=method]').property('value')
		model = new EnsembleBinaryModel(function () {
			return new SVM(kernel, kernel_args)
		}, method)
		model.init(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
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
