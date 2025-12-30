import GeneticKMeans from '../../lib/model/genetic_kmeans.js'
import Controller from '../controller.js'

var dispGKMeans = (elm, platform) => {
	platform.setting.ml.reference = {
		author: 'K. Krishna, M. N. Murty',
		title: 'Genetic K-means algorithm',
		year: 1999,
	}
	const controller = new Controller(platform)
	let model = null

	elm.append('span').text('k')
	elm.append('input').attr('name', 'k').attr('type', 'number').attr('min', 1).attr('max', 100).attr('value', 3)
	controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			const k = +elm.select('[name=k]').property('value')
			model = new GeneticKMeans(k, 10)
			model.init(platform.trainInput)
		})
		.step(cb => {
			model.fit()
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred.map(v => v + 1)
			platform.centroids(
				model.centroids,
				model.centroids.map((c, i) => i + 1),
				{
					line: true,
					duration: 1000,
				}
			)
			cb && setTimeout(cb, 1000)
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispGKMeans(platform.setting.ml.configElement, platform)
}
