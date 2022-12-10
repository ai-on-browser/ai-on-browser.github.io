import ALMA from '../../lib/model/alma.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new ALMA(p.value, alpha.value, b.value, c.value)
			}, method.value)
		}
		const ty = platform.trainOutput.map(v => v[0])
		model.fit(platform.trainInput, ty)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const method = controller.select(['oneone', 'onerest'])
	const p = controller.input.number({ label: ' p = ', min: 1, max: 100, value: 2 })
	const alpha = controller.input.number({ label: ' alpha = ', min: 0, max: 1, step: 0.1, value: 1 })
	const b = controller.input.number({ label: ' b = ', min: 0, max: 100, step: 0.1, value: 1 })
	const c = controller.input.number({ label: ' c = ', min: 0, max: 100, step: 0.1, value: 1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
