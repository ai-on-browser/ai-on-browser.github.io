import INFLO from '../../lib/model/inflo.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'S. Suman',
		title: 'Improving Influenced Outlierness(INFLO) Outlier Detection Method',
		year: 2013,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new INFLO(k.value)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers.map(v => v > t.value)
	}

	const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: 5 }).on('change', calc)
	const t = controller.input.number({ label: ' t = ', min: 0, max: 100, step: 0.1, value: 2 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
