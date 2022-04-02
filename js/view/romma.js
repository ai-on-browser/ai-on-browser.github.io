import { ROMMA, AggressiveROMMA } from '../../lib/model/romma.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispROMMA = function (elm, platform) {
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		const type = elm.select('[name=type]').property('value')
		const model = new EnsembleBinaryModel(type === '' ? ROMMA : AggressiveROMMA, method)
		model.init(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		model.fit()

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
		cb && cb()
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
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispROMMA(platform.setting.ml.configElement, platform)
}
