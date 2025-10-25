import MultivariateKernelDensityEstimator from '../../lib/model/multivariate_kernel_density_estimator.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Multivariate kernel density estimation (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new MultivariateKernelDensityEstimator(method.value)
		model.fit(platform.trainInput)

		const pred = model.predict(platform.testInput(8))
		if (platform.task === 'DE') {
			const min = Math.min(...pred)
			const max = Math.max(...pred)
			platform.testResult(pred.map(v => specialCategory.density((v - min) / (max - min))))
		} else {
			const y = model.predict(platform.trainInput)
			platform.trainResult = y.map(v => v < threshold.value)
			platform.testResult(pred.map(v => v < threshold.value))
		}
	}

	const method = controller.select(['silverman', 'scott'])
	let threshold = null
	if (platform.task === 'AD') {
		threshold = controller.input
			.number({ label: ' threshold = ', min: 0, max: 10, step: 0.01, value: 0.3 })
			.on('change', fitModel)
	}
	controller.input.button('Fit').on('click', () => fitModel())
}
