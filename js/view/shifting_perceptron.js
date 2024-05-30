import ShiftingPerceptron from '../../lib/model/shifting_perceptron.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'G. Cavallanti, N. Cesa-Bianchi, C. Gentile',
		title: 'Tracking the Best Hyperplane with a Simple Budget Perceptron',
		year: 2007,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new ShiftingPerceptron(lambda.value)
			}, method.value)
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const method = controller.select(['oneone', 'onerest'])
	const lambda = controller.input.number({ label: ' lambda ', min: 0, max: 100, step: 0.1, value: 1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
