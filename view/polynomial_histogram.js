import { Matrix } from '../lib/util/math.js'

import PolynomialHistogram from '../lib/model/polynomial_histogram.js'

var dispPolynomialHistogram = function (elm, platform) {
	const fitModel = cb => {
		const p = +elm.select('[name=p]').property('value')
		const h = +elm.select('[name=h]').property('value')
		platform.fit((tx, ty) => {
			const model = new PolynomialHistogram(p, h)
			model.fit(tx)

			platform.predict((px, pred_cb) => {
				let pred = Matrix.fromArray(model.predict(px))
				pred.div(pred.max())
				pred = pred.value.map(specialCategory.density)
				pred_cb(pred)
			}, 4)
		})
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
