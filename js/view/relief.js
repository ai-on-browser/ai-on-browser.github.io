import { ReliefF } from '../../lib/model/relief.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'I. Kononenko',
		title: 'Estimating Attributes: Analysis and Extensions of RELIEF ',
		year: 1994,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new ReliefF(m.value, tau.value, k.value, type.value)
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const y = model.predict(platform.trainInput)
		platform.trainResult = y
	}
	const type = controller.select({ values: ['E', 'F'], value: 'F' }).on('change', calc)
	const m = controller.input.number({ label: 'm', min: 1, max: 1000, value: 20 }).on('change', calc)
	const tau = controller.input.number({ label: 't', min: 0, max: 10, step: 0.1, value: 0 }).on('change', calc)
	const k = controller.input.number({ label: 'k', min: 1, max: 100, value: 10 }).on('change', calc)
	controller.input.button('Fit').on('click', calc)
}
