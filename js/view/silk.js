import { ILK, SILK } from '../../lib/model/silk.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'L. Cheng, S. V. N. Vishwanathan, D. Schuurmans, S. Wang, T. Caelli',
		title: 'Implicit Online Learning with Kernels',
		year: 2006,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				if (type.value === 'ilk') {
					return new ILK(eta.value, lambda.value, c.value, kernel.value, loss.value)
				}
				return new SILK(eta.value, lambda.value, c.value, w.value, kernel.value, loss.value)
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
	const type = controller.select(['ilk', 'silk'])
	const kernel = controller.select(['gaussian', 'polynomial'])
	const eta = controller.input.number({ label: ' eta ', min: 0, max: 100, step: 0.1, value: 0.1 })
	const lambda = controller.input.number({ label: ' lambda ', min: 0, max: 100, step: 0.1, value: 0.1 })
	const c = controller.input.number({ label: ' c ', min: 0, max: 100, step: 0.1, value: 0.1 })
	const w = controller.input.number({ label: ' w ', min: 0, max: 1000, value: 10 })
	const loss = controller.select(['square', 'hinge', 'logistic'])
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
