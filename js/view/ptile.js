import PTile from '../../lib/model/ptile.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	platform.colorSpace = 'gray'
	const controller = new Controller(platform)
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		const model = new PTile(p.value)
		const y = model.predict(platform.trainInput.flat(2))
		threshold.value = model._t
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
	}

	const p = controller.input.number({ label: ' p = ', min: 0, max: 1, step: 0.1, value: 0.5 }).on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
	const threshold = controller.text({ label: ' Estimated threshold ' })
}
