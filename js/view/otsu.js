import OtsusThresholding from '../../lib/model/otsu.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	platform.setting.ml.reference = {
		title: "Otsu's method",
		url: 'https://en.wikipedia.org/wiki/Otsu%27s_method',
	}
	platform.colorSpace = 'gray'
	const controller = new Controller(platform)
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		const model = new OtsusThresholding()
		const y = model.predict(platform.trainInput.flat(2))
		threshold.value = model._t
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
	}

	controller.input.button('Fit').on('click', fitModel)
	const threshold = controller.text({ label: ' Estimated threshold ' })
}
