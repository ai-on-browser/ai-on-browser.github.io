import YinyangKMeans from '../../lib/model/yinyang_kmeans.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'Y. Ding, Y. Zhao, X. Shen, M. Musuvathi, T. Mytkowicz',
		title: 'Yinyang k-means: A drop-in replacement of the classic k-means with consistent speedup',
		year: 2015,
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			model = new YinyangKMeans(k.value, t.value)
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
	const t = controller.input.number({ label: ' t ', min: 1, max: 100, value: 1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
		})
		.step(fitModel)
		.epoch()
}
