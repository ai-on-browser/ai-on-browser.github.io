import Matrix from '../../lib/util/matrix.js'

import PolynomialHistogram from '../../lib/model/polynomial_histogram.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new PolynomialHistogram(p.value, h.value)
		model.fit(platform.trainInput)

		let pred = Matrix.fromArray(model.predict(platform.testInput(4)))
		pred.div(pred.max())
		pred = pred.value.map(specialCategory.density)
		platform.testResult(pred)
	}

	const p = controller.input.number({ label: 'p ', min: 0, max: 2, value: 2 }).on('change', fitModel)
	const h = controller.input.number({ label: ' h ', min: 0, step: 0.01, value: 0.1 }).on('change', fitModel)
	controller.input.button('Fit').on('click', () => fitModel())
}
