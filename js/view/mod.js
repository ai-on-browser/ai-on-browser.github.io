import MOD from '../../lib/model/mod.js'
import Controller from '../controller.js'

var dispMOD = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Sparse dictionary learning (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Sparse_dictionary_learning#Method_of_optimal_directions_(MOD)',
	}
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
