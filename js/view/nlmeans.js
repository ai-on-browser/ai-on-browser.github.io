import NLMeans from '../../lib/model/nlmeans.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'A. Buades, B. Coll, J. M. Morel',
		title: 'A non-local algorithm for image denoising',
		year: 2005,
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 5
		model = new NLMeans(n.value, h.value)
		const y = model.predict(platform.trainInput)
		platform.trainResult = y.flat(1)
		platform._step = orgStep
	}

	const n = controller.input.number({ label: 'n', min: 1, max: 100, value: 2 })
	const h = controller.input.number({ label: 'h', min: 0, max: 100, step: 0.1, value: 2 })
	controller.input.button('Fit').on('click', fitModel)
}
