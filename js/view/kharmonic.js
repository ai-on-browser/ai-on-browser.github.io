import KHarmonicMeans from '../../lib/model/kharmonic.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'B. Zhang, M. Hsu, U. Dayal',
		title: 'K-Harmonic Means - A Data Clustering Algorithm',
		year: 1999,
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		if (!model) {
			model = new KHarmonicMeans(k.value)
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
		cb && cb()
	}

	const k = controller.input.number({ label: ' k ', min: 1, max: 1000, value: 3 }).on('change', fitModel)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
		})
		.step(fitModel)
		.epoch()
}
