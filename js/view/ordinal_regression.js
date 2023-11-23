import OrdinalRegression from '../../lib/model/ordinal_regression.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	const step = 4

	let learn_epoch = 0
	let model = null

	const fitModel = cb => {
		if (!model) {
			return
		}

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		console.log(model)
		const pred = model.predict(platform.testInput(step))
		platform.testResult(pred)
		learn_epoch++

		cb && cb()
	}

	const rate = controller.input.number({ label: ' Learning rate ', value: 0.001, min: 0, max: 100, step: 0.001 })
	controller
		.stepLoopButtons()
		.init(() => {
			learn_epoch = 0
			model = new OrdinalRegression(rate.value)
			platform.init()
		})
		.step(fitModel)
		.epoch(() => learn_epoch)
}
