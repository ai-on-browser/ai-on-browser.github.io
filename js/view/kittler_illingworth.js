import KittlerIllingworthThresholding from '../../lib/model/kittler_illingworth.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'J. Kittler, J. Illingworth',
		title: 'Minimum error thresholding',
		year: 1985,
	}
	platform.colorSpace = 'gray'
	const controller = new Controller(platform)
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		const model = new KittlerIllingworthThresholding()
		const y = model.predict(platform.trainInput.flat(2))
		threshold.value = model._t
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
	}

	controller.input.button('Fit').on('click', fitModel)
	const threshold = controller.text({ label: ' Estimated threshold ' })
}
