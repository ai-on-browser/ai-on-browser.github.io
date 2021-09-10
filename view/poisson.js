import PoissonRegression from '../lib/model/poisson.js'

var dispPoisson = function (elm, platform) {
	let model = null
	const fitModel = cb => {
		const rate = +elm.select('[name=rate]').property('value')
		platform.fit((tx, ty) => {
			if (!model) {
				model = new PoissonRegression(rate)
			}
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px)
				pred_cb(pred)
				cb && cb()
			}, 4)
		})
	}

	elm.append('span').text(' Learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'rate')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.attr('value', 0.1)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Step" button.'
	dispPoisson(platform.setting.ml.configElement, platform)
}
