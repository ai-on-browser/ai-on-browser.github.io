import BayesianLinearRegression from '../../lib/model/bayesian_linear.js'
import Controller from '../controller.js'

var dispBayesianLinearRegression = function (elm, platform) {
	const controller = new Controller(platform)
	let model
	const fitModel = cb => {
		if (!model) {
			const l = +elm.select('[name=lambda]').property('value')
			const s = +elm.select('[name=sigma]').property('value')
			model = new BayesianLinearRegression(l, s)
		}
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
		cb && cb()
	}

	elm.append('select')
		.selectAll('option')
		.data(['online'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text('lambda = ')
	elm.append('input')
		.attr('name', 'lambda')
		.attr('type', 'number')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.attr('value', 0.1)
	elm.append('span').text('sigma = ')
	elm.append('input')
		.attr('name', 'sigma')
		.attr('type', 'number')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.attr('value', 0.2)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispBayesianLinearRegression(platform.setting.ml.configElement, platform)
}
