import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Pegasos from '../../lib/model/pegasos.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'S. Shalev-Shwartz, Y. Singer, N. Srebro, A. Cotter',
		title: 'Pegasos: Primal Estimated sub-GrAdient SOlver for SVM',
		year: 2011,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(() => new Pegasos(rate.value, k.value), method.value)
			model.init(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
		}
		model.fit()

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const method = controller.select(['oneone', 'onerest'])
	const rate = controller.input.number({ label: ' Learning rate ', min: 0, max: 100, step: 0.01, value: 0.05 })
	const k = controller.input.number({ label: ' Batch size ', min: 1, max: 1000, value: 10 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
