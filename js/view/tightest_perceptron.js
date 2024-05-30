import TightestPerceptron from '../../lib/model/tightest_perceptron.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'Z. Wang, S. Vucetic',
		title: 'Tighter perceptron with improved dual use of cached data for model representation and validation',
		year: 2009,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new TightestPerceptron(b.value, kernel.value, aloss.value)
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
	const kernel = controller.select(['gaussian', 'polynomial'])
	const b = controller.input.number({ label: ' b ', min: 0, max: 1000, value: 10 })
	const aloss = controller.select({ values: ['zero_one', 'hinge'], value: 'hinge' })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
