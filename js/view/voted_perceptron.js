import VotedPerceptron from '../../lib/model/voted_perceptron.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'L. Mclnnes, J. Healy, J. Melville',
		title: 'Large Margin Classification Using the Perceptron Algorithm',
		year: 2018,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = cb => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new VotedPerceptron(rate.value)
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
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.1, value: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
