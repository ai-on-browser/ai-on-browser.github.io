import AutomaticThresholding from '../../lib/model/automatic_thresholding.js'
import Controller from '../controller.js'

var dispAutomatic = function (elm, platform) {
	platform.colorSpace = 'gray'
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				model = new AutomaticThresholding()
			}
			model.fit(tx.flat(2))
			let y = model.predict(tx.flat(2))
			elm.select('[name=threshold]').text(model._th)
			pred_cb(y.map(v => specialCategory.density(1 - v)))
			cb && cb()
		}, 1)
	}

	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			elm.select('[name=threshold]').text(0)
		})
		.step(fitModel)
		.epoch()
	elm.append('span').text(' Estimated threshold ')
	elm.append('span').attr('name', 'threshold')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispAutomatic(platform.setting.ml.configElement, platform)
}
