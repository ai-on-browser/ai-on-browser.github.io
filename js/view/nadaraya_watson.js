import NadarayaWatson from '../../lib/model/nadaraya_watson.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Kernel regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Kernel_regression#Nadaraya%E2%80%93Watson_kernel_regression',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const s = sgm.value
		const auto = autoCheck.element.checked
		const model = new NadarayaWatson(auto ? null : s)
		model.fit(platform.trainInput, platform.trainOutput)
		if (auto) {
			sgm.value = model._s
		}

		const pred = model.predict(platform.testInput(10))
		platform.testResult(pred)
	}

	const autoCheck = controller.input({ type: 'checkbox', label: 'auto' }).on('change', () => {
		sgm.element.disabled = autoCheck.element.checked
	})
	autoCheck.element.checked = true
	const sgm = controller.input.number({ min: 0, value: 0.1, step: 0.01 })
	sgm.element.disabled = true
	controller.input.button('Fit').on('click', () => fitModel())
}
