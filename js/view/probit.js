import { Probit, MultinomialProbit } from '../../lib/model/probit.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

var dispProbit = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Probit model (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Probit_model',
	}
	const controller = new Controller(platform)
	let model = null

	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		if (!model) {
			if (method === 'multinomial') {
				model = new MultinomialProbit()
			} else {
				model = new EnsembleBinaryModel(Probit, method)
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
		cb && cb()
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['oneone', 'onerest', 'multinomial'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispProbit(platform.setting.ml.configElement, platform)
}
