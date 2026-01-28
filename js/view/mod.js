import MOD from '../../lib/model/mod.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Sparse dictionary learning (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Sparse_dictionary_learning#Method_of_optimal_directions_(MOD)',
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		const dim = platform.dimension
		if (!model) {
			model = new MOD(dim)
			model.init(platform.trainInput)
		}
		const pred = model.fit()
		platform.trainResult = pred
	}
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
}
