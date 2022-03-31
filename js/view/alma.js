import ALMA from '../../lib/model/alma.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispALMA = function (elm, platform) {
	const calc = cb => {
		const method = elm.select('[name=method]').property('value')
		const p = +elm.select('[name=p]').property('value')
		const alpha = +elm.select('[name=alpha]').property('value')
		const b = +elm.select('[name=b]').property('value')
		const c = +elm.select('[name=c]').property('value')
		const model = new EnsembleBinaryModel(function () {
			return new ALMA(p, alpha, b, c)
		}, method)
		const ty = platform.trainOutput.map(v => v[0])
		model.init(platform.trainInput, ty)
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
	elm.append('span').text(' p = ')
	elm.append('input').attr('type', 'number').attr('name', 'p').attr('min', 1).attr('max', 100).attr('value', 2)
	elm.append('span').text(' alpha = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'alpha')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 1)
		.attr('step', 0.1)
	elm.append('span').text(' b = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'b')
		.attr('min', 0)
		.attr('max', 100)
		.attr('value', 1)
		.attr('step', 0.1)
	elm.append('span').text(' c = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 0)
		.attr('max', 100)
		.attr('value', 1)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispALMA(platform.setting.ml.configElement, platform)
}
