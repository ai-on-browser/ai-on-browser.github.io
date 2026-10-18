import MOD from '../../lib/model/mean_shift_outlier_detection.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'J. Yang, S. Rahardja, P. Franti',
		title: 'Mean-shift outlier detection',
		year: 2018,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new MOD(k.value)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers
	}

	const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: 5 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
