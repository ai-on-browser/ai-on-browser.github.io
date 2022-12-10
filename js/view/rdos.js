import RDOS from '../../lib/model/rdos.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'E. Schubert, A. Zimek, H. P. Kriegel',
		title: 'Generalized Outlier Detection with Flexible Kernel Density Estimates',
		year: 2014,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new RDOS(k.value, h.value)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers.map(v => v > t.value)
	}

	const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: 20 }).on('change', calc)
	const h = controller.input.number({ label: ' h = ', min: 0, max: 100, step: 0.1, value: 0.2 }).on('change', calc)
	const t = controller.input.number({ label: ' t = ', min: 0, max: 100, step: 0.1, value: 1.1 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
