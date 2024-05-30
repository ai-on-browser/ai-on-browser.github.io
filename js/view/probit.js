import { Probit, MultinomialProbit } from '../../lib/model/probit.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		title: 'Probit model (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Probit_model',
	}
	const controller = new Controller(platform)
	let model = null

	const calc = () => {
		if (!model) {
			if (method.value === 'multinomial') {
				model = new MultinomialProbit()
			} else {
				model = new EnsembleBinaryModel(Probit, method.value)
				model.init(
					platform.trainInput,
					platform.trainOutput.map(v => v[0])
				)
			}
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const method = controller.select(['oneone', 'onerest', 'multinomial'])
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
