import KDEOS from '../../lib/model/kdeos.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calc = () => {
		const model = new KDEOS(kmin.value, kmax.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v > threshold.value)
	}

	const kmin = controller.input.number({ label: ' k min = ', min: 1, max: 100, value: 5 }).on('change', calc)
	const kmax = controller.input.number({ label: ' k max = ', min: 1, max: 100, value: 10 }).on('change', calc)
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 1, step: 0.1, value: 0.5 })
		.on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
