import DPMeans from '../../lib/model/dp_means.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'B. Kulis, M. I. Jordan',
		title: 'Revisiting k-means: New Algorithms via Bayesian Nonparametrics',
		year: 2012,
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			model = new DPMeans(lambda.value)
		}
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		platform.centroids(
			model.centroids,
			model.centroids.map((_, i) => i + 1),
			{ line: true }
		)
		clusters.value = model.centroids.length
	}

	const lambda = controller.input.number({ label: 'lambda', min: 0, step: 0.1, value: 0.3 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
		})
		.step(fitModel)
		.epoch()
	const clusters = controller.text({ label: ' Clusters: ' })
}
