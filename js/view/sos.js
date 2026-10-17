import SOS from '../../lib/model/sos.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'J. Janssens, F. Huszar, E. Postma, J. van den Herik',
		title: 'Stochastic Outlier Selection',
		year: 2012,
	}
	const controller = new Controller(platform)

	const calc = () => {
		const th = threshold.value
		const model = new SOS(h.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v > th)
	}

	const h = controller.input.number({ label: ' h ', min: 0, max: 10, step: 0.1, value: 4.5 })
	const threshold = controller.input
		.number({ label: ' threshold ', min: 0, max: 1, step: 0.01, value: 0.9 })
		.on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
