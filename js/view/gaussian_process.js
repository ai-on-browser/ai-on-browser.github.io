import GaussianProcess from '../../lib/model/gaussian_process.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

var dispGaussianProcess = function (elm, platform) {
	const controller = new Controller(platform)
	const mode = platform.task
	let model = null

	const fitModel = cb => {
		const dim = platform.datas.dimension
		const kernel = elm.select('[name=kernel]').property('value')
		const beta = +elm.select('[name=beta]').property('value')
		if (mode === 'CF') {
			const method = elm.select('[name=method]').property('value')
			if (!model) {
				const ty = platform.trainOutput.map(v => v[0])
				model = new EnsembleBinaryModel(function () {
					return new GaussianProcess(kernel, beta)
				}, method)
				model.init(platform.trainInput, ty)
			}
			model.fit()
			const categories = model.predict(platform.testInput(10))
			platform.testResult(categories)
			cb && cb()
		} else {
			const rate = +elm.select('[name=rate]').property('value')
			if (!model) {
				model = new GaussianProcess(kernel, beta)
				model.init(platform.trainInput, platform.trainOutput)
			}

			model.fit(rate)

			let pred = model.predict(platform.testInput(dim === 1 ? 2 : 10))
			platform.testResult(pred)
			cb && cb()
		}
	}

	if (mode === 'CF') {
		elm.append('select')
			.attr('name', 'method')
			.selectAll('option')
			.data(['oneone', 'onerest'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
	}
	elm.append('select')
		.attr('name', 'kernel')
		.selectAll('option')
		.data(['gaussian'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' Beta ')
	elm.append('select')
		.attr('name', 'beta')
		.selectAll('option')
		.data([0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.select('[name=beta]').property('value', 1)
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	elm.append('span').text(' Learning rate ')
	elm.append('select')
		.attr('name', 'rate')
		.selectAll('option')
		.data([0.0001, 0.001, 0.01, 0.1, 1, 10])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	slbConf.step(fitModel).epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize" button. Finally, click "Fit" button.'
	dispGaussianProcess(platform.setting.ml.configElement, platform)
}
