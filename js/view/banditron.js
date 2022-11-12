import Banditron from '../../lib/model/banditron.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	const controller = new Controller(platform)
	let model = null
	const calc = cb => {
		if (!model) {
			model = new Banditron(gamma.value)
			model.init(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
		}
		model.fit()

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
		cb && cb()
	}

	const gamma = controller.input.number({ label: ' gamma ', min: 0, max: 0.5, step: 0.1, value: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
