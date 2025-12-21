import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import TighterPerceptron from '../../lib/model/tighter_perceptron.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'J. Weston, A. Bordes, L. Bottou',
		title: 'Online (and Offline) on an Even Tighter Budget',
		year: 2005,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(
				() => new TighterPerceptron(beta.value, p.value, update.value),
				method.value
			)
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
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
