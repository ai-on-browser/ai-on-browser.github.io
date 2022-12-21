import { BasisFunctions } from './least_square.js'

import LpNormLinearRegression from '../../lib/model/lpnorm_linear.js'
import Controller from '../controller.js'

var dispLpNormLinearRegression = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Iteratively reweighted least squares (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Iteratively_reweighted_least_squares',
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			const p = elm.select('[name=p]').property('value')
			model = new LpNormLinearRegression(p)
		}
		model.fit(basisFunctions.apply(platform.trainInput), platform.trainOutput)

		let pred = model.predict(basisFunctions.apply(platform.testInput(4)))
		platform.testResult(pred)
	}

	const basisFunctions = new BasisFunctions(platform)
	basisFunctions.makeHtml(elm)

	elm.append('span').text('p')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'p')
		.attr('min', 0)
		.attr('max', 10)
		.attr('value', 1)
		.attr('step', 0.1)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLpNormLinearRegression(platform.setting.ml.configElement, platform)
}
