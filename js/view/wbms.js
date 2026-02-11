import WeightedBlurringMeanShift from '../../lib/model/wbms.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		author: 'S. Chakraborty, D. Paul, S. Das',
		title: 'Automated Clustering of High-dimensional Data with a Feature Weighted Mean Shift Algorithm',
		year: 2021,
	}
	const controller = new Controller(platform)

	let model = null

	const h = controller.input.number({ label: 'h', min: 0, max: 10, step: 0.01, value: 0.05 })
	const lambda = controller.input.number({ label: 'lambda', min: 0.01, max: 10, step: 0.01, value: 1.0 })
	const threshold = controller.input.number({ label: 'threshold', min: 0, max: 10, step: 0.01, value: 0.01 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = new WeightedBlurringMeanShift(h.value, lambda.value, threshold.value)
			model.init(platform.trainInput)
			const pred = model.predict()
			platform.trainResult = pred.map(v => v + 1)
			clusters.value = model.size
			platform.centroids(
				model._c,
				model._c.map((_, i) => i + 1)
			)
		})
		.step(() => {
			if (model === null) {
				return
			}
			model.fit()
			const pred = model.predict()
			platform.trainResult = pred.map(v => v + 1)
			clusters.value = model.size
			platform.centroids(
				model._c,
				model._c.map((_, i) => pred[i] + 1)
			)
		})
	const clusters = controller.text({ label: ' clusters ', value: 0 })
}
