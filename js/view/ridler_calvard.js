import RidlerCalvardThresholding from '../../lib/model/ridler_calvard.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'H. J. Trussell',
		title: 'Comments on "Picture thresholding Using an Iterative Selection Method"',
		year: 1978,
	}
	platform.colorSpace = 'gray'
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		if (!model) {
			model = new RidlerCalvardThresholding()
			model.init(platform.trainInput.flat(2))
		}
		model.fit()
		const y = model.predict()
		threshold.value = model._t
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
	}

	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			threshold.value = ''
		})
		.step(fitModel)
	const threshold = controller.text({ label: ' Estimated threshold ' })
}
