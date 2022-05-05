import LDF from '../../lib/model/ldf.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calc = () => {
		const model = new LDF(k.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v > threshold.value)
	}

	const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: 5 }).on('change', calc)
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 100, step: 0.1, value: 3 })
		.on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
