import Mountain from '../../lib/model/mountain.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		author: 'R. R. Yager, D. P. Filev',
		title: 'Approximate Clustering Via the Mountain Method',
		year: 1994,
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			model = new Mountain(resolution.value, alpha.value, beta.value)
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		platform.testResult(model.predict(platform.testInput(4)).map(v => v + 1))

		clusters.value = model._centroids.length
		platform.centroids(
			model._centroids,
			model._centroids.map((v, i) => i + 1)
		)
	}

	const resolution = controller.input.number({ label: ' resolution ', min: 1, max: 1000, value: 100 })
	const alpha = controller.input.number({ label: ' alpha ', min: 0, max: 100, step: 0.1, value: 5.4 })
	const beta = controller.input.number({ label: ' beta ', min: 1, max: 100, step: 0.1, value: 5.4 })
	controller.input.button('Initialize').on('click', () => {
		model = null
		clusters.value = 0
		platform.init()
	})
	controller.input.button('Step').on('click', () => {
		fitModel()
	})
	const clusters = controller.text({ label: ' Clusters: ' })
}
