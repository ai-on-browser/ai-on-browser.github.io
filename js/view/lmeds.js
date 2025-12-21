import LeastMedianSquaresRegression from '../../lib/model/lmeds.js'
import Controller from '../controller.js'

var dispLMS = (elm, platform) => {
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			model = new LeastMedianSquaresRegression()
		}
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

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
	dispLMS(platform.setting.ml.configElement, platform)
}
