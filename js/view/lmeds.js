import LeastMedianSquaresRegression from '../../lib/model/lmeds.js'
import Controller from '../controller.js'

var dispLMS = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty) => {
			if (!model) {
				model = new LeastMedianSquaresRegression()
			}
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				pred_cb(pred)
			}, 4)
		})
	}

	controller
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
	dispLMS(platform.setting.ml.configElement, platform)
}
