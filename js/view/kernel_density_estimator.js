import KernelDensityEstimator from '../../lib/model/kernel_density_estimator.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new KernelDensityEstimator(kernel.value)
		model.fit(platform.trainInput, autoCheck.value ? 0 : h.value)
		h.value = model._h

		const pred = model.predict(platform.testInput(8))
		if (platform.task === 'DE') {
			platform.testResult(pred)
		} else {
			const y = model.predict(platform.trainInput)
			platform.trainResult = y.map(v => v < threshold.value)
			platform.testResult(pred.map(v => v < threshold.value))
		}
	}

	const kernel = controller.select(['gaussian', 'rectangular', 'triangular', 'epanechnikov', 'biweight', 'triweight'])
	const autoCheck = controller.input({ label: 'auto', type: 'checkbox', checked: true }).on('change', () => {
		h.element.disabled = autoCheck.value
	})
	const h = controller.input.number({ min: 0, step: 0.01, value: 0.1, disabled: true })
	let threshold = null
	if (platform.task === 'AD') {
		threshold = controller.input
			.number({ label: ' threshold = ', min: 0, max: 10, step: 0.01, value: 0.3 })
			.on('change', fitModel)
	}
	controller.input.button('Fit').on('click', () => fitModel())
}
