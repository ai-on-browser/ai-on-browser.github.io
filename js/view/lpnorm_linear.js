import LpNormLinearRegression from '../../lib/model/lpnorm_linear.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Iteratively reweighted least squares (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Iteratively_reweighted_least_squares',
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			model = new LpNormLinearRegression(p.value)
		}
		model.fit(platform.trainInput, platform.trainOutput)

		let pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	const p = controller.input.number({ min: 0, max: 10, value: 1, step: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
