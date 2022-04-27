import AROW from '../../lib/model/arow.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispAROW = function (elm, platform) {
	const calc = () => {
		const method = elm.select('[name=method]').property('value')
		const r = +elm.select('[name=r]').property('value')
		const model = new EnsembleBinaryModel(function () {
			return new AROW(r)
		}, method)
		const ty = platform.trainOutput.map(v => v[0])
		model.init(platform.trainInput, ty)
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
	elm.append('span').text(' r = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'r')
		.attr('min', 0)
		.attr('max', 10)
		.attr('value', 0.1)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispAROW(platform.setting.ml.configElement, platform)
}
