import ProjectionPursuit from '../lib/model/ppr.js'

var dispPPR = function (elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const r = +elm.select('[name=r]').property('value')
			if (!model) {
				model = new ProjectionPursuit(r)
			}
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px)
				pred_cb(pred)
			}, 4)
		})
	}

	elm.append('span').text(' r ')
	elm.append('input').attr('type', 'number').attr('name', 'r').attr('value', 5).attr('min', 1).attr('max', 100)
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
	dispPPR(platform.setting.ml.configElement, platform)
}
