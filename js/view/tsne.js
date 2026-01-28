import { SNE, tSNE } from '../../lib/model/tsne.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Then, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		title: 't-distributed stochastic neighbor embedding (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding',
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (model === null) {
			return
		}
		const y = model.fit()
		platform.trainResult = y
	}

	const type = controller.select(['SNE', 'tSNE'])
	controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			const dim = platform.dimension
			if (type.value === 'SNE') {
				model = new SNE(dim)
			} else {
				model = new tSNE(dim)
			}
			model.init(platform.trainInput)
		})
		.step(fitModel)
		.epoch()
}
