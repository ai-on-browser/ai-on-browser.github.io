import GeneticKMeans from '../../lib/model/genetic_kmeans.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		author: 'K. Krishna, M. N. Murty',
		title: 'Genetic K-means algorithm',
		year: 1999,
	}
	const controller = new Controller(platform)
	let model = null

	const k = controller.input.number({ label: 'k', min: 1, max: 100, value: 3 })
	controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			model = new GeneticKMeans(k.value, 10)
			model.init(platform.trainInput)
		})
		.step(cb => {
			model.fit()
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred.map(v => v + 1)
			platform.centroids(
				model.centroids,
				model.centroids.map((_, i) => i + 1),
				{
					line: true,
					duration: 1000,
				}
			)
			cb && setTimeout(cb, 1000)
		})
}
