import BPA from '../../lib/model/bpa.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'Z. Wang, S. Vucetic',
		title: 'Online Passive-Aggressive Algorithms on a Budget',
		year: 2010,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(() => new BPA(c.value, b.value, version.value, kernel.value), method.value)
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
	const version = controller.select(['simple', 'projecting', 'nn'])
	const c = controller.input.number({ label: ' Regularization ', min: 0, max: 100, step: 0.1, value: 1 })
	const b = controller.input.number({ label: ' Budget size ', min: 1, max: 1000, value: 10 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
