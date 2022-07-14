import QuantileRegression from '../../../lib/model/quantile_regression.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			model = new QuantileRegression(t.value)
		}
		model.fit(platform.trainInput, platform.trainInput, lr.value)

		let pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	const t = controller.input.number({ label: ' t ', min: 0, max: 1, step: 0.1, value: 0.5 })
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	const lr = controller.input.number({ label: ' learning rate ', min: 0, max: 10, step: 0.001, value: 0.001 })
	slbConf.step(fitModel).epoch()
}
