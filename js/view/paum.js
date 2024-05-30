import PAUM from '../../lib/model/paum.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'Y. Li, H. Zaragoza, R. Herbrich, J. Shawe-Taylor, J. Kandola',
		title: 'The perceptron algorithm with uneven margins',
		year: 2002,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(function () {
				return new PAUM(rate.value, tp.value, tm.value)
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
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.1, value: 0.1 })
	const tp = controller.input.number({ label: ' Margin(+1) ', min: 0, max: 100, step: 0.1, value: 1 })
	const tm = controller.input.number({ label: ' Margin(-1) ', min: 0, max: 100, step: 0.1, value: 1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
