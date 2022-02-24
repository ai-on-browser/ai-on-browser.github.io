import PrincipalCurve from '../../lib/model/principal_curve.js'

var dispPC = function (elm, platform) {
	let model = new PrincipalCurve()
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = new PrincipalCurve()
			platform.init()
		})
		.step(cb => {
			platform.fit((tx, ty, pred_cb) => {
				const dim = platform.dimension
				model.fit(tx)
				const y = model.predict(tx, dim)
				pred_cb(y)
				cb && cb()
			})
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPC(platform.setting.ml.configElement, platform)
}
