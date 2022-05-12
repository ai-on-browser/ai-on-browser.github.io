import PTile from '../../lib/model/ptile.js'
import { specialCategory } from '../utils.js'

var dispPTile = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const p = +elm.select('[name=p]').property('value')
		const orgStep = platform._step
		platform._step = 1
		const model = new PTile(p)
		const y = model.predict(platform.trainInput.flat(2))
		elm.select('[name=threshold]').text(model._t)
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
	}

	elm.append('span').text(' p = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'p')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 0.5)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Estimated threshold ')
	elm.append('span').attr('name', 'threshold')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispPTile(platform.setting.ml.configElement, platform)
}
