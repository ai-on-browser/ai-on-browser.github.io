import GaussianProcess from '../../lib/model/gaussian_process.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize" button. Finally, click "Fit" button.'
	const controller = new Controller(platform)
	const mode = platform.task
	let model = null

	const fitModel = () => {
		const dim = platform.datas.dimension
		if (mode === 'CF') {
			if (!model) {
				const ty = platform.trainOutput.map(v => v[0])
				model = new EnsembleBinaryModel(function () {
					return new GaussianProcess(kernel.value, +beta.value)
				}, method.value)
				model.init(platform.trainInput, ty)
			}
			model.fit()
			const categories = model.predict(platform.testInput(10))
			platform.testResult(categories)
		} else {
			if (!model) {
				model = new GaussianProcess(kernel.value, +beta.value)
				model.init(platform.trainInput, platform.trainOutput)
			}

			model.fit(+rate.value)

			let pred = model.predict(platform.testInput(dim === 1 ? 2 : 10))
			platform.testResult(pred)
		}
	}

	let method = null
	if (mode === 'CF') {
		method = controller.select(['oneone', 'onerest'])
	}
	const kernel = controller.select(['gaussian'])
	const beta = controller.select({ label: ' Beta ', values: [0.001, 0.01, 0.1, 1, 10, 100], value: 1 })
	const slbConf = controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	})
	const rate = controller.select({ label: ' Learning rate ', values: [0.0001, 0.001, 0.01, 0.1, 1, 10] })
	slbConf.step(fitModel).epoch()
}
