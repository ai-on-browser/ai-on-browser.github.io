import { BasisFunctions } from './least_square.js'

import LpNormLinearRegression from '../lib/model/lpnorm_linear.js'

var dispLpNormLinearRegression = function (elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty) => {
			if (!model) {
				const p = elm.select('[name=p]').property('value')
				model = new LpNormLinearRegression(p)
			}
			model.fit(basisFunctions.apply(tx), ty)

			platform.predict((px, pred_cb) => {
				let pred = model.predict(basisFunctions.apply(px))
				pred_cb(pred)
			}, 4)
		})
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
	platform.setting.ml.controller
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
