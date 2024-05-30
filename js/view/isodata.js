import ISODATA from '../../lib/model/isodata.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			model = new ISODATA(init_k.value, min_k.value, max_k.value, min_n.value, spl_std.value, merge_dist.value)
			model.init(platform.trainInput)
		}
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = model.size
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{ line: true }
		)
	}

	const init_k = controller.input.number({ label: ' init k ', min: 1, max: 100, value: 20 })
	const max_k = controller.input.number({ label: ' max k ', min: 2, max: 100, value: 100 })
	const min_k = controller.input.number({ label: ' min k ', min: 1, max: 100, value: 2 })
	const min_n = controller.input.number({ label: ' min n ', min: 1, max: 100, value: 2 })
	const spl_std = controller.input.number({ label: ' split std ', min: 0.01, max: 100, step: 0.01, value: 1 })
	const merge_dist = controller.input.number({ label: ' merge dist ', min: 0.01, max: 10, step: 0.01, value: 0.1 })
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
