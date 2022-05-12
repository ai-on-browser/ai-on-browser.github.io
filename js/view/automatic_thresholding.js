import AutomaticThresholding from '../../lib/model/automatic_thresholding.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

var dispAutomatic = function (elm, platform) {
	platform.colorSpace = 'gray'
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		const orgStep = platform._step
		platform._step = 1
		if (!model) {
			model = new AutomaticThresholding()
		}
		model.fit(platform.trainInput.flat(2))
		const y = model.predict(platform.trainInput.flat(2))
		elm.select('[name=threshold]').text(model._th)
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
		cb && cb()
	}

	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			elm.select('[name=threshold]').text(0)
		})
		.step(fitModel)
		.epoch()
	elm.append('span').text(' Estimated threshold ')
	elm.append('span').attr('name', 'threshold')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispAutomatic(platform.setting.ml.configElement, platform)
}
