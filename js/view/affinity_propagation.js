import AffinityPropagation from '../../lib/model/affinity_propagation.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			model = new AffinityPropagation()
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = model.size
		platform.centroids(
			model.centroids,
			model.categories.map(v => v + 1)
		)
	}

	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			clusters.value = 0
			platform.init()
		})
		.step(fitModel)
		.epoch()
	const clusters = controller.text({ label: ' Clusters: ' })
}
