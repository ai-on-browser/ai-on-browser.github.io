import PoissonRegression from '../../lib/model/poisson.js'
import Controller from '../controller.js'

var dispPoisson = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Poisson regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Poisson_regression',
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		const rate = +elm.select('[name=rate]').property('value')
		if (!model) {
			model = new PoissonRegression(rate)
		}
		model.fit(platform.trainInput, platform.trainOutput)

		let pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
		cb && cb()
	}

	elm.append('span').text(' Learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'rate')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.attr('value', 0.1)
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
	platform.setting.ml.usage = 'Click and add data point. Next, click "Step" button.'
	dispPoisson(platform.setting.ml.configElement, platform)
}
