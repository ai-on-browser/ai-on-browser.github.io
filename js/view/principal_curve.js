import PrincipalCurve from '../../lib/model/principal_curve.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	let model = new PrincipalCurve()
	controller
		.stepLoopButtons()
		.init(() => {
			model = new PrincipalCurve()
			platform.init()
		})
		.step(() => {
			const dim = platform.dimension
			model.fit(platform.trainInput)
			const y = model.predict(platform.trainInput, dim)
			platform.trainResult = y
		})
}
