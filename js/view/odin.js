import ODIN from '../../lib/model/odin.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calc = () => {
		const model = new ODIN(k.value, t.value)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers
	}

	const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: 5 }).on('change', calc)
	const t = controller.input.number({ label: ' t = ', min: 0, max: 100, value: 1 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
