import Matrix from '../../lib/util/matrix.js'

import PolynomialHistogram from '../../lib/model/polynomial_histogram.js'
import { specialCategory } from '../utils.js'

var dispPolynomialHistogram = function (elm, platform) {
	const fitModel = () => {
		const p = +elm.select('[name=p]').property('value')
		const h = +elm.select('[name=h]').property('value')
		const model = new PolynomialHistogram(p, h)
		model.fit(platform.trainInput)

		let pred = Matrix.fromArray(model.predict(platform.testInput(4)))
		pred.div(pred.max())
		pred = pred.value.map(specialCategory.density)
		platform.testResult(pred)
	}

	elm.append('span').text('p ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'p')
		.attr('min', 0)
		.attr('max', 2)
		.attr('value', 2)
		.on('change', fitModel)
	elm.append('span').text(' h ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'h')
		.attr('min', 0)
		.attr('value', 0.1)
		.attr('step', 0.01)
		.on('change', fitModel)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPolynomialHistogram(platform.setting.ml.configElement, platform)
}
