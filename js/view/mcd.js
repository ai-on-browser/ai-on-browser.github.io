import MCD from '../../lib/model/mcd.js'
import Controller from '../controller.js'

var dispMCD = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const calcMCD = cb => {
		const threshold = +elm.select('[name=threshold]').property('value')
		const srate = +elm.select('[name=srate]').property('value')
		if (!model) model = new MCD(platform.trainInput, srate)
		model.fit()
		const outliers = model.predict(platform.trainInput).map(v => v > threshold)
		platform.trainResult = outliers
		const outlier_tiles = model.predict(platform.testInput(3)).map(v => v > threshold)
		platform.testResult(outlier_tiles)
		cb && cb()
	}

	elm.append('span').text(' Sampling rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'srate')
		.property('value', 0.9)
		.attr('min', 0.1)
		.attr('max', 1)
		.attr('step', 0.1)
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 2)
		.attr('min', 0)
		.attr('max', 10)
		.property('required', true)
		.attr('step', 0.1)
		.on('change', calcMCD)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			calcMCD()
		})
		.step(calcMCD)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispMCD(platform.setting.ml.configElement, platform)
}
