import RVM from '../../lib/model/rvm.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Relevance vector machine (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Relevance_vector_machine',
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		model.fit(platform.trainInput, platform.trainOutput)

		let pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
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
