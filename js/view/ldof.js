import LDOF from '../../lib/model/ldof.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calc = () => {
		const model = new LDOF(k.value)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers.map(v => v > t.value)
	}

	const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: 5 }).on('change', calc)
	const t = controller.input.number({ label: ' t = ', min: 0, max: 100, step: 0.1, value: 1.5 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
