import { ROMMA, AggressiveROMMA } from '../../lib/model/romma.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

var dispROMMA = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const calc = () => {
		if (!model) {
			const method = elm.select('[name=method]').property('value')
			const type = elm.select('[name=type]').property('value')
			model = new EnsembleBinaryModel(type === '' ? ROMMA : AggressiveROMMA, method)
			model.init(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
		}
		model.fit()

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['oneone', 'onerest'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('select')
		.attr('name', 'type')
		.selectAll('option')
		.data(['', 'aggressive'])
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
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	dispROMMA(platform.setting.ml.configElement, platform)
}
