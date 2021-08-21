import Snakes from '../model/snakes.js'

var dispSnakes = function (elm, platform) {
	platform.colorSpace = 'gray'
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			model.fit()
			let y = model.predict(tx)
			pred_cb(y.flat())
		}, 1)
	}

	elm.append('span').text(' alpha ')
	elm.append('input').attr('type', 'number').attr('name', 'alpha').attr('value', 1).attr('min', 0).attr('max', 10)
	elm.append('span').text(' beta ')
	elm.append('input').attr('type', 'number').attr('name', 'beta').attr('value', 1).attr('min', 0).attr('max', 10)
	elm.append('span').text(' gamma ')
	elm.append('input').attr('type', 'number').attr('name', 'gamma').attr('value', 1).attr('min', 0).attr('max', 10)
	elm.append('span').text(' k ')
	elm.append('input').attr('type', 'number').attr('name', 'k').attr('value', 20).attr('min', 1).attr('max', 1000)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			const alpha = +elm.select('[name=alpha]').property('value')
			const beta = +elm.select('[name=beta]').property('value')
			const gamma = +elm.select('[name=gamma]').property('value')
			const k = +elm.select('[name=k]').property('value')
			model = new Snakes(alpha, beta, gamma, k)
			platform.fit((tx, ty) => {
				model.init(tx)
			}, 1)
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispSnakes(platform.setting.ml.configElement, platform)
}