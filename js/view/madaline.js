import MADALINE from '../../lib/model/madaline.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'B. Widrow, M. A. Lehr',
		title: '30 Years of Adaptive Neural Networks: Perceptron, Madaline, and Backpropagation',
		year: 1990,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = cb => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new MADALINE(sizes.value, +rule.value, rate.value)
			}, method.value)
		}
		model.fit(platform.trainInput, platform.trainOutput)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
		cb && cb()
	}

	const method = controller.select(['oneone', 'onerest'])
	const rule = controller.select(['1', '2', '3'])
	const sizes = controller.array({ label: ' Layer size ', type: 'number', values: [5], default: 5, min: 0, max: 100 })
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.01 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
