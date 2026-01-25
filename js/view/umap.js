import UMAP from '../../lib/model/umap.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Then, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		author: 'L. Mclnnes, J. Healy, J. Melville',
		title: 'UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction',
		year: 2018,
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

	const n = controller.input.number({ label: ' n = ', min: 1, max: 100, value: 10 })
	const mindist = controller.input.number({ label: ' min-dist = ', min: 0, max: 10, step: 0.1, value: 1 })
	controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			const dim = platform.dimension
			model = new UMAP(dim, n.value, mindist.value)
			model.init(platform.trainInput)
		})
		.step(fitModel)
		.epoch()
}
