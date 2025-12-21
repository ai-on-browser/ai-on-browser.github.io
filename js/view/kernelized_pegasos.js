import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import KernelizedPegasos from '../../lib/model/kernelized_pegasos.js'
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
			model = new EnsembleBinaryModel(() => new KernelizedPegasos(rate.value, kernel.value), method.value)
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
	const kernel = controller.select(['gaussian', 'polynomial'])
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
