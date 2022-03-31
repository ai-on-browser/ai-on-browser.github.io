import MOD from '../../lib/model/mod.js'
import Controller from '../controller.js'

var dispMOD = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		const dim = platform.dimension
		if (!model) {
			model = new MOD(platform.trainInput, dim)
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
	dispMOD(platform.setting.ml.configElement, platform)
}
