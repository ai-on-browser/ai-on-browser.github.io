import Sammon from '../../lib/model/sammon.js'
import Controller from '../controller.js'

var dispSammon = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		const dim = platform.dimension
		if (!model) {
			model = new Sammon(platform.trainInput, dim)
		}
		const pred = model.fit()
		platform.trainResult = pred
		cb && cb()
	}
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispSammon(platform.setting.ml.configElement, platform)
}
