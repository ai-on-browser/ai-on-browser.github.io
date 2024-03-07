import HartiganWongKMeans from '../../lib/model/hartigan_wong_kmeans.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'k-means clustering (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/K-means_clustering#Hartigan%E2%80%93Wong_method',
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			model = new HartiganWongKMeans(k.value)
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{
				line: true,
			}
		)
	}

	const k = controller.input.number({ label: ' k ', min: 1, max: 1000, value: 3 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
		})
		.step(fitModel)
		.epoch()
}
