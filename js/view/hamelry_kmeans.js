import HamelryKMeans from '../../lib/model/hamelry_kmeans.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'G. Hamelry',
		title: 'Making k-means Even Faster',
		year: 2010,
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			model = new HamelryKMeans(k.value)
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
