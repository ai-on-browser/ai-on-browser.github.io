import Snakes from '../../lib/model/snakes.js'
import Controller from '../controller.js'

var dispSnakes = function (elm, platform) {
	platform.colorSpace = 'gray'
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		model.fit()
		let y = model.predict(platform.trainInput)
		platform.trainResult = y.flat()
		platform._step = orgStep
	}

	elm.append('span').text(' alpha ')
	elm.append('input').attr('type', 'number').attr('name', 'alpha').attr('value', 1).attr('min', 0).attr('max', 10)
	elm.append('span').text(' beta ')
	elm.append('input').attr('type', 'number').attr('name', 'beta').attr('value', 1).attr('min', 0).attr('max', 10)
	elm.append('span').text(' gamma ')
	elm.append('input').attr('type', 'number').attr('name', 'gamma').attr('value', 1).attr('min', 0).attr('max', 10)
	elm.append('span').text(' k ')
	elm.append('input').attr('type', 'number').attr('name', 'k').attr('value', 20).attr('min', 1).attr('max', 1000)
	controller
		.stepLoopButtons()
		.init(() => {
			const alpha = +elm.select('[name=alpha]').property('value')
			const beta = +elm.select('[name=beta]').property('value')
			const gamma = +elm.select('[name=gamma]').property('value')
			const k = +elm.select('[name=k]').property('value')
			model = new Snakes(alpha, beta, gamma, k)
			const orgStep = platform._step
			platform._step = 1
			model.init(platform.trainInput)
			platform._step = orgStep
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispSnakes(platform.setting.ml.configElement, platform)
}
