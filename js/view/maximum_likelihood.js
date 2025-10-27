import MaximumLikelihoodEstimator from '../../lib/model/maximum_likelihood.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new MaximumLikelihoodEstimator(distribution.value)
		model.fit(platform.trainInput)

		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	const distribution = controller.select(['normal'])
	controller.input.button('Fit').on('click', () => fitModel())
}
