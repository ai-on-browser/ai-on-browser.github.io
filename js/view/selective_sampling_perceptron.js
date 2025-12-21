import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import {
	SelectiveSamplingAdaptivePerceptron,
	SelectiveSamplingPerceptron,
} from '../../lib/model/selective_sampling_perceptron.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'N. Cesa-Bianchi, C. Gentile, L. Zaniboni',
		title: 'Worst-case analysis of selective sampling for linear classification',
		year: 2006,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(() => {
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
