import { Perceptron, AveragedPerceptron, MulticlassPerceptron } from '../../lib/model/perceptron.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	const controller = new Controller(platform)
	let model = null
	const calc = cb => {
		if (!model) {
			if (type.value === 'multiclass') {
				model = new MulticlassPerceptron(rate.value)
			} else {
				model = new EnsembleBinaryModel(function () {
					if (type.value === 'average') {
						return new AveragedPerceptron(rate.value)
					}
					return new Perceptron(rate.value)
				}, method.value)
			}
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

	const type = controller.select(['', 'average', 'multiclass']).on('change', () => {
		if (type.value === 'multiclass') {
			method.element.style.display = 'none'
		} else {
			method.element.style.display = null
		}
	})
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
