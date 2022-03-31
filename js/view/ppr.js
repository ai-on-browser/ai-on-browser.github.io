import ProjectionPursuit from '../../lib/model/ppr.js'
import Controller from '../controller.js'

var dispPPR = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		const r = +elm.select('[name=r]').property('value')
		if (!model) {
			model = new ProjectionPursuit(r)
		}
		model.fit(platform.trainInput, platform.trainOutput)

		let pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	elm.append('span').text(' r ')
	elm.append('input').attr('type', 'number').attr('name', 'r').attr('value', 5).attr('min', 1).attr('max', 100)
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
	dispPPR(platform.setting.ml.configElement, platform)
}
