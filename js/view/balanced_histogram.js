import BalancedHistogramThresholding from '../../lib/model/balanced_histogram.js'
import { specialCategory } from '../utils.js'

var dispBHT = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		const mincount = +elm.select('[name=mincount]').property('value')
		const model = new BalancedHistogramThresholding(mincount)
		let y = model.predict(platform.trainInput.flat(2))
		elm.select('[name=threshold]').text(model._t)
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
	}

	elm.append('span').text(' ignore min count ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'mincount')
		.attr('value', 100)
		.attr('min', 0)
		.attr('max', 10000)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Estimated threshold ')
	elm.append('span').attr('name', 'threshold')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispBHT(platform.setting.ml.configElement, platform)
}
