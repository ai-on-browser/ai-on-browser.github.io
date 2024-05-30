import BOGD from '../../lib/model/bogd.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'P. Zhao, J. Wang, P. Wu, R. Jin, S. C. H. Hoi',
		title: 'Fast Bounded Online Gradient Descent Algorithms',
		year: 2012,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new BOGD(b.value, eta.value, lambda.value, gamma.value, sampling.value, kernel.value, loss.value)
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
	const sampling = controller.select({ values: ['uniform', 'nonuniform'], value: 'nonuniform' })
	const loss = controller.select({ values: ['zero_one', 'hinge'], value: 'hinge' })
	const b = controller.input.number({ label: ' B ', min: 0, max: 100, value: 10 })
	const eta = controller.input.number({ label: ' eta ', min: 0, max: 100, step: 0.1, value: 0.2 })
	const lambda = controller.input.number({ label: ' lambda ', min: 0, max: 100, step: 0.1, value: 0.1 })
	const gamma = controller.input.number({ label: ' gamma ', min: 0, max: 1000, step: 0.1, value: 10 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
