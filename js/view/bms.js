import BlurringMeanShift from '../../lib/model/bms.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	const controller = new Controller(platform)

	let model = null

	const pred = () => {
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = model.size
		platform.centroids(
			model._c,
			model._c.map((_, i) => i + 1)
		)
	}

	const h = controller.input.number({ label: 'h', min: 0, max: 10, step: 0.01, value: 0.05 })
	const threshold = controller.input.number({ label: 'threshold', min: 0, max: 10, step: 0.01, value: 0.01 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = new BlurringMeanShift(h.value, threshold.value)
			model.init(platform.trainInput)
			pred()
		})
		.step(() => {
			if (model === null) {
				return
			}
			model.fit()
			pred()
		})
	const clusters = controller.text({ label: ' clusters ', value: 0 })
}
