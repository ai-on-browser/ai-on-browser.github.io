import NOF from '../../lib/model/nof.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'J. Huang, Q. Zhu, L. Yang, J. Feng',
		title: 'A non-parameter outlier detection algorithm based on Natural Neighbor',
		year: 2015,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const auto = autoCheck.element.checked
		const model = new NOF(auto ? 0 : k.value)
		const outliers = model.predict(platform.trainInput)
		if (auto) {
			k.value = model._k
		}
		platform.trainResult = outliers.map(v => v > t.value)
	}

	const autoCheck = controller.input({ type: 'checkbox', checked: true }).on('change', () => {
		k.element.disabled = autoCheck.element.checked
	})
	const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: 20 }).on('change', calc)
	k.element.disabled = true
	const t = controller.input.number({ label: ' t = ', min: 0, max: 100, step: 0.1, value: 1.8 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
