import {
	SelectiveSamplingPerceptron,
	SelectiveSamplingAdaptivePerceptron,
} from '../../lib/model/selective_sampling_perceptron.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	const controller = new Controller(platform)
	let model = null
	const calc = cb => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				if (type.value === 'adaptive') {
					return new SelectiveSamplingAdaptivePerceptron(b.value, rate.value)
				} else {
					return new SelectiveSamplingPerceptron(b.value, rate.value)
				}
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

	const type = controller.select(['', 'adaptive'])
	const method = controller.select(['oneone', 'onerest'])
	const b = controller.input.number({ label: ' Smoothing parameter ', min: 0, max: 100, step: 0.1, value: 1 })
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
