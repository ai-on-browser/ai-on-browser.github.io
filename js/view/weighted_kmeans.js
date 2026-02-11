import WeightedKMeans from '../../lib/model/weighted_kmeans.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		author: 'A. M. Baswade, K. D. Joshi, P. S. Nalwade',
		title: 'A Comparative Study Of K-Means And Weighted K-Means For Clustering',
		year: 2012,
	}
	const controller = new Controller(platform)
	let model = null

	const beta = controller.input.number({ label: 'beta', min: 1, max: 10, step: 0.1, value: 2 })
	const slbConf = controller.stepLoopButtons().init(() => {
		platform.init()
		model = new WeightedKMeans(beta.value)
		clusters.value = `${model.size} clusters`
	})
	controller.input.button('Add centroid').on('click', () => {
		model.add(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{ line: true }
		)
		clusters.value = `${model.size} clusters`
	})
	const clusters = controller.text('0 clusters')

	slbConf.step(async () => {
		if (model.size === 0) {
			return
		}
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{ line: true, duration: 1000 }
		)
		await new Promise(resolve => setTimeout(resolve, 1000))
	})
	controller.input.button('Skip').on('click', () => {
		const tx = platform.trainInput
		while (model.fit(tx) > 1.0e-8);
		const pred = model.predict(tx)
		platform.trainResult = pred.map(v => v + 1)
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{ line: true, duration: 1000 }
		)
	})
}
