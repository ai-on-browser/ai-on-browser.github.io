import DUOL from '../../lib/model/duol.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'P. Zhao, S. C. H. Hoi, R. Jin',
		title: 'A Double Updating Approach for Online Learning',
		year: 2009,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			model = new EnsembleBinaryModel(() => new DUOL(c.value, rho.value, kernel.value), method.value)
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		console.log(model)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const method = controller.select(['oneone', 'onerest'])
	const kernel = controller.select(['gaussian', 'polynomial'])
	const c = controller.input.number({ label: ' Regularization ', min: 0, max: 100, step: 0.1, value: 5 })
	const rho = controller.input.number({ label: ' Threshold ', min: 0, max: 1, step: 0.1, value: 0.5 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
