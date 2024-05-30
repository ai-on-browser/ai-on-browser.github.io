import SoftKMeans from '../../lib/model/soft_kmeans.js'

import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	const controller = new Controller(platform)
	let model = null

	const fitModel = update => {
		if (update) {
			model.fit()
		}
		const pred = Matrix.fromArray(model.predict())
		platform.trainResult = pred.argmax(1).value.map(v => v + 1)
		platform.centroids(
			model._c,
			model._c.map((c, i) => i + 1),
			{ line: true }
		)
	}

	const beta = controller.input.number({ label: 'beta', min: 0, max: 1000, step: 0.1, value: 10 })
	const addCentroid = () => {
		model.add()
		clusters.value = model._c.length + ' clusters'
		platform.centroids(
			model._c,
			model._c.map((c, i) => i + 1),
			{ line: true }
		)
		fitModel(false)
	}
	const slbConf = controller.stepLoopButtons().init(() => {
		model = new SoftKMeans(beta.value)
		model.init(platform.trainInput)
		platform.init()

		addCentroid()
	})
	controller.input.button('Add centroid').on('click', addCentroid)
	const clusters = controller.text('0 clusters')
	slbConf
		.step(() => {
			fitModel(true)
		})
		.epoch()
}
