import BSGD from '../../lib/model/bsgd.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	const controller = new Controller(platform)
	let model = null
	const calc = cb => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new BSGD(b.value, eta.value, lambda.value, maintenance.value, kernel.value)
			}, method.value)
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

	const method = controller.select(['oneone', 'onerest'])
	const kernel = controller.select(['gaussian', 'polynomial'])
	const maintenance = controller.select(['removal', 'projection', 'merging'])
	const b = controller.input.number({ label: ' B ', min: 0, max: 100, value: 10 })
	const eta = controller.input.number({ label: ' eta ', min: 0, max: 100, step: 0.1, value: 1 })
	const lambda = controller.input.number({ label: ' lambda ', min: 0, max: 100, step: 0.1, value: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
