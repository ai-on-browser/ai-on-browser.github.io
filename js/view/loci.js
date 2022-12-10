import { LOCI } from '../../lib/model/loci.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'S. Papadimitriou, H. Kitagawa, P. B. Gibbons, C. Faloutsos',
		title: 'LOCI: Fast Outlier Detection Using the Local Correlation Integral',
		year: 2002,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new LOCI(alpha.value)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers
	}

	const alpha = controller.input
		.number({ label: ' alpha = ', min: 0, max: 1, step: 0.1, value: 0.5 })
		.on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
