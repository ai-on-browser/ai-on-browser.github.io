import MixtureDiscriminant from '../../lib/model/mda.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new MixtureDiscriminant(r.value)
			model.init(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
		}
		model.fit()
		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const r = controller.input.number({ label: ' r ', min: 1, max: 100, value: 10 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
