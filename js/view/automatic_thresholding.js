import AutomaticThresholding from '../../lib/model/automatic_thresholding.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	platform.colorSpace = 'gray'
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		if (!model) {
			model = new AutomaticThresholding()
		}
		model.fit(platform.trainInput.flat(2))
		const y = model.predict(platform.trainInput.flat(2))
		threshold.value = model._th
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
	}

	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			threshold.value = 0
		})
		.step(fitModel)
		.epoch()
	const threshold = controller.text({ label: ' Estimated threshold ' })
}
