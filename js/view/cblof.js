import { WardsAgglomerativeClustering } from '../../lib/model/agglomerative.js'
import CBLOF from '../../lib/model/cblof.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'Z. He, X. Xu, S. Deng',
		title: 'Discovering Cluster Based Local Outliers',
		year: 2003,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new CBLOF(alpha.value, beta.value, x => {
			const mdl = new WardsAgglomerativeClustering()
			mdl.fit(x)
			return mdl.predict(10)
		})
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers.map(v => v > t.value)
	}

	const alpha = controller.input
		.number({ label: ' alpha ', min: 0, max: 1, step: 0.1, value: 0.5 })
		.on('change', calc)
	const beta = controller.input
		.number({ label: ' beta ', min: 1, max: 100, step: 0.1, value: 1.1 })
		.on('change', calc)
	const t = controller.input
		.number({ label: ' threshold ', min: 0, max: 1000, step: 0.1, value: 0.2 })
		.on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
