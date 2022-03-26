import RVM from '../../lib/model/rvm.js'
import Controller from '../controller.js'

var dispRVM = function (elm, platform) {
	const controller = new Controller(platform)
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

	controller
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
