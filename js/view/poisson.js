import PoissonRegression from '../../lib/model/poisson.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Step" button.'
	platform.setting.ml.reference = {
		title: 'Poisson regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Poisson_regression',
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			model = new PoissonRegression(rate.value)
		}
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.1, value: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
