import WeightedKNN from '../../lib/model/weighted_knn.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'K. Hechenbichler, K. Schliep',
		title: 'Weighted k-Nearest-Neighbor Techniques and Ordinal Classification',
		year: 2004,
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new WeightedKNN(k.value, metric.value, weight.value)

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const categories = model.predict(platform.testInput(4))
		platform.testResult(categories)
	}

	const metric = controller.select(['euclid', 'manhattan', 'chebyshev'])
	const weight = controller.select([
		'gaussian',
		'rectangular',
		'triangular',
		'epanechnikov',
		'quartic',
		'triweight',
		'cosine',
		'inversion',
	])
	const k = controller.input.number({ label: 'k', min: 1, max: 1000, value: 5 })
	controller.input.button('Calculate').on('click', fitModel)
}
