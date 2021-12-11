import HuberRegression from '../../lib/model/huber_regression.js'

var dispHR = function (elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty) => {
			if (!model) {
				const e = +elm.select('[name=e]').property('value')
				model = new HuberRegression(e)
			}
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px)
				pred_cb(pred)
			}, 4)
		})
	}

	elm.append('span').text(' e ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'e')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
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
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispHR(platform.setting.ml.configElement, platform)
}
