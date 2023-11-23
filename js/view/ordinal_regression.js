import OrdinalRegression from '../../lib/model/ordinal_regression.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Ordinal regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Ordinal_regression',
	}
	const controller = new Controller(platform)

	let model = null
	const fitModel = () => {
		if (!model) {
			return
		}

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	const rate = controller.input.number({ label: ' Learning rate ', value: 0.001, min: 0, max: 100, step: 0.001 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = new OrdinalRegression(rate.value)
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
