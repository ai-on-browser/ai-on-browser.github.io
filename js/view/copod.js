import COPOD from '../../lib/model/copod.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'Z. Li, Y. Zhao, N. Botta, C. Ionescu, X. Hu',
		title: 'COPOD: Copula-Based Outlier Detection',
		year: 2020,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new COPOD()
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers.map(v => v > t.value)
	}

	const t = controller.input.number({ label: ' t = ', min: 0, max: 100, step: 0.1, value: 5 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
