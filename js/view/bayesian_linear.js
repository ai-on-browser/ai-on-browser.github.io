import BayesianLinearRegression from '../../lib/model/bayesian_linear.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	let model
	const fitModel = () => {
		if (!model) {
			model = new BayesianLinearRegression(lambda.value, sigma.value)
		}
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	controller.select(['online'])
	const lambda = controller.input.number({ label: 'lambda = ', min: 0, max: 100, step: 0.1, value: 0.1 })
	const sigma = controller.input.number({ label: 'sigma = ', min: 0, max: 100, step: 0.1, value: 0.2 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
