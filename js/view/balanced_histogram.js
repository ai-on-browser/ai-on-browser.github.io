import BalancedHistogramThresholding from '../../lib/model/balanced_histogram.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Balanced histogram thresholding (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Balanced_histogram_thresholding',
	}
	platform.colorSpace = 'gray'
	const controller = new Controller(platform)
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		const model = new BalancedHistogramThresholding(mincount.value)
		let y = model.predict(platform.trainInput.flat(2))
		threshold.value = model._t
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
	}

	const mincount = controller.input
		.number({ label: ' ignore min count ', min: 0, max: 10000, value: 100 })
		.on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
	const threshold = controller.text({ label: ' Estimated threshold ' })
}
