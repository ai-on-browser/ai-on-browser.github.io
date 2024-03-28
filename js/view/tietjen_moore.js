import TietjenMoore from '../../lib/model/tietjen_moore.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const calcTietjenMoore = function () {
		const model = new TietjenMoore(k.value, threshold.value)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers
	}

	const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: 5 }).on('change', calcTietjenMoore)
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 1, step: 0.1, value: 0.2 })
		.on('change', calcTietjenMoore)
	controller.input.button('Calculate').on('click', calcTietjenMoore)
}
