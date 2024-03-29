import OPTICS from '../../lib/model/optics.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'OPTICS algorithm (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/OPTICS_algorithm',
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new OPTICS(threshold.value, eps.value, minpts.value, metric.value)
		model.fit(platform.trainInput)
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		cluster.value = new Set(pred).size
	}

	const metric = controller.select(['euclid', 'manhattan', 'chebyshev']).on('change', () => fitModel())
	const eps = controller.input
		.number({ label: 'eps', min: 0.01, max: 100, step: 0.01, value: 100 })
		.on('change', () => fitModel())
	const minpts = controller.input
		.number({ label: 'min pts', min: 2, max: 1000, value: 10 })
		.on('change', () => fitModel())
	const threshold = controller.input
		.number({ label: 'threshold', min: 0.01, max: 10, step: 0.01, value: 0.08 })
		.on('change', () => fitModel())
	controller.input.button('Fit').on('click', () => fitModel())
	const cluster = controller.text({ label: ' Clusters: ' })
}
