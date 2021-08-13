import RVM from '../model/rvm.js'

var dispRVM = function (elm, platform) {
	let model = null
	const fitModel = cb => {
		platform.fit((tx, ty) => {
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				let pred = model.predict(px)
				pred_cb(pred)
				cb && cb()
			}, 4)
		})
	}

	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = new RVM()
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispRVM(platform.setting.ml.configElement, platform)
}
