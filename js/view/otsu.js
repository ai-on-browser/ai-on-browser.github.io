import OtsusThresholding from '../../lib/model/otsu.js'
import { specialCategory } from '../utils.js'

var dispOtsu = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		const model = new OtsusThresholding()
		let y = model.predict(platform.trainInput.flat(2))
		elm.select('[name=threshold]').text(model._t)
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
	}

	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Estimated threshold ')
	elm.append('span').attr('name', 'threshold')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispOtsu(platform.setting.ml.configElement, platform)
}
