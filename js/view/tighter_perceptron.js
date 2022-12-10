import TighterPerceptron from '../../lib/model/tighter_perceptron.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	const controller = new Controller(platform)
	let model = null
	const calc = cb => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new TighterPerceptron(beta.value, p.value, update.value)
			}, method.value)
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
		cb && cb()
	}

	const method = controller.select(['oneone', 'onerest'])
	const beta = controller.input.number({ label: ' beta ', min: 0, max: 100, step: 0.1, value: 0.1 })
	const p = controller.input.number({ label: ' p ', min: 0, max: 1000, value: 10 })
	const update = controller.select(['perceptron', 'mira', 'nobias'])
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
