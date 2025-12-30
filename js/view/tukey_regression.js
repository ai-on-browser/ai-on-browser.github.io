import TukeyRegression from '../../lib/model/tukey_regression.js'
import Controller from '../controller.js'

var dispTR = (elm, platform) => {
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			const e = +elm.select('[name=e]').property('value')
			model = new TukeyRegression(e)
		}
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	elm.append('span').text(' e ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'e')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 100)
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
	dispTR(platform.setting.ml.configElement, platform)
}
