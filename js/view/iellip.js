import { CELLIP, IELLIP } from '../../lib/model/iellip.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispCELLIP = function (elm, platform) {
	const calc = () => {
		const method = elm.select('[name=method]').property('value')
		const type = elm.select('[name=type]').property('value')
		let model
		if (type === 'CELLIP') {
			const gamma = +elm.select('[name=gamma]').property('value')
			const a = +elm.select('[name=a]').property('value')
			model = new EnsembleBinaryModel(function () {
				return new CELLIP(gamma, a)
			}, method)
		} else {
			const b = +elm.select('[name=b]').property('value')
			const c = +elm.select('[name=c]').property('value')
			model = new EnsembleBinaryModel(function () {
				return new IELLIP(b, c)
			}, method)
		}
		model.init(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
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
		.on('change', () => {
			const type = elm.select('[name=type]').property('value')
			elm.selectAll('.params').style('display', 'none')
			elm.selectAll(`.${type.toLowerCase()}`).style('display', null)
		})
		.selectAll('option')
		.data(['CELLIP', 'IELLIP'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	const cel = elm.append('span').classed('params', true).classed('cellip', true)
	cel.append('span').text(' gamma = ')
	cel.append('input')
		.attr('type', 'number')
		.attr('name', 'gamma')
		.attr('min', 0)
		.attr('max', 10)
		.attr('value', 1)
		.attr('step', 0.1)
	cel.append('span').text(' a = ')
	cel.append('input')
		.attr('type', 'number')
		.attr('name', 'a')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 0.5)
		.attr('step', 0.1)
	const iel = elm.append('span').classed('params', true).classed('iellip', true).style('display', 'none')
	iel.append('span').text(' b = ')
	iel.append('input')
		.attr('type', 'number')
		.attr('name', 'b')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 0.5)
		.attr('step', 0.1)
	iel.append('span').text(' c = ')
	iel.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 0.5)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispCELLIP(platform.setting.ml.configElement, platform)
}
