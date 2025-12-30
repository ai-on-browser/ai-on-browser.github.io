import { ConfidenceWeighted, SoftConfidenceWeighted } from '../../lib/model/confidence_weighted.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import Controller from '../controller.js'

var dispConfidenceWeighted = (elm, platform) => {
	const controller = new Controller(platform)
	const calc = () => {
		const cost = +elm.select('[name=cost]').property('value')
		const ty = platform.trainOutput.map(v => v[0])
		const mdl = type.value === 'cw' ? ConfidenceWeighted : SoftConfidenceWeighted
		const prm = type.value === 'cw' ? [eta.value] : [eta.value, cost, type.value === 'scw-1' ? 1 : 2]
		const model = new EnsembleBinaryModel(() => new mdl(...prm), method.value)
		model.init(platform.trainInput, ty)
		model.fit()

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	const method = controller.select({ values: ['oneone', 'onerest'], name: 'method' })
	const type = controller.select({ values: ['cw', 'scw-1', 'scw-2'], name: 'type' }).on('change', () => {
		if (type.value === 'cw') {
			celm.style('display', 'none')
		} else {
			celm.style('display', 'inline')
		}
	})
	const celm = elm.append('span').style('display', 'none')
	celm.append('span').text(' cost = ')
	celm.append('input').attr('type', 'number').attr('name', 'cost').attr('min', 0).attr('max', 100).attr('value', 1)
	const eta = controller.input.number({
		label: ' eta = ',
		name: 'eta',
		min: 0.5,
		max: 1,
		step: 0.01,
		value: 0.9,
	})
	controller.input.button('Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispConfidenceWeighted(platform.setting.ml.configElement, platform)
}
