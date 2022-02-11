import KSVD from '../../lib/model/ksvd.js'

var dispKSVD = function (elm, platform) {
	let model = null
	const fitModel = cb => {
		const dim = platform.dimension
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				model = new KSVD(tx, dim)
			}
			model.fit()
			const pred = model.predict()
			pred_cb(pred)
			cb && cb()
		})
	}
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispKSVD(platform.setting.ml.configElement, platform)
}
