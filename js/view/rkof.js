import RKOF from '../../lib/model/rkof.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calc = () => {
		const model = new RKOF(k.value, h.value, alpha.value)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers.map(v => v > t.value)
	}

	const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: 20 }).on('change', calc)
	const h = controller.input.number({ label: ' h = ', min: 0, max: 100, step: 0.1, value: 0.2 }).on('change', calc)
	const alpha = controller.input
		.number({ label: ' alpha = ', min: 0, max: 1, step: 0.1, value: 0.5 })
		.on('change', calc)
	const t = controller.input.number({ label: ' t = ', min: 0, max: 100, step: 0.1, value: 1.3 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
