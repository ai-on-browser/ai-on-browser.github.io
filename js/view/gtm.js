import GTM from '../../lib/model/gtm.js'
import Controller from '../controller.js'

var dispGTM = function (elm, platform) {
	const mode = platform.task
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		if (!model) {
			cb && cb()
			return
		}

		model.fit(platform.trainInput)
		if (mode === 'CT') {
			const pred = model.predictIndex(platform.trainInput)
			platform.trainResult = pred.map(v => v + 1)
			const tilePred = model.predictIndex(platform.testInput(4))
			platform.testResult(tilePred.map(v => v + 1))
		} else {
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred
		}
		cb && cb()
	}

	if (mode != 'DR') {
		elm.append('span').text(' Size ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'resolution')
			.attr('value', 10)
			.attr('min', 1)
			.attr('max', 100)
			.property('required', true)
	} else {
		elm.append('span').text(' Resolution ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'resolution')
			.attr('max', 100)
			.attr('min', 1)
			.attr('value', 20)
	}
	controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			if (platform.datas.length === 0) {
				return
			}
			const dim = platform.dimension || 1
			const resolution = +elm.select('[name=resolution]').property('value')

			model = new GTM(2, dim, resolution)
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	dispGTM(platform.setting.ml.configElement, platform)
}
