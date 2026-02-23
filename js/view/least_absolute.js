import LeastAbsolute from '../../lib/model/least_absolute.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'F. H. Thanoon',
		title: 'Robust Regression by Least Absolute Deviations Method',
		year: 2015,
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			model = new LeastAbsolute()
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
