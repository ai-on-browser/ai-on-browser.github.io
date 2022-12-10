import RVM from '../../lib/model/rvm.js'
import Controller from '../controller.js'

var dispRVM = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Relevance vector machine (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Relevance_vector_machine',
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		model.fit(platform.trainInput, platform.trainOutput)

		let pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
		cb && cb()
	}

	controller
		.stepLoopButtons()
		.init(() => {
			model = new RVM()
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispRVM(platform.setting.ml.configElement, platform)
}
