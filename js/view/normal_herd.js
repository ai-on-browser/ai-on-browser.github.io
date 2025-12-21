import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'
import NormalHERD from '../../lib/model/normal_herd.js'

var dispNormalHERD = (elm, platform) => {
	platform.setting.ml.reference = {
		author: 'K. Crammer, D. Lee',
		title: 'Learning via Gaussian Herding',
		year: 2010,
	}
	const calc = () => {
		const method = elm.select('[name=method]').property('value')
		const type = elm.select('[name=type]').property('value')
		const c = +elm.select('[name=c]').property('value')
		const model = new EnsembleBinaryModel(() => new NormalHERD(type, c), method)
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
		.selectAll('option')
		.data(['full', 'exact', 'project', 'drop'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text(' c = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'c')
		.attr('min', 0)
		.attr('max', 10)
		.attr('value', 0.1)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispNormalHERD(platform.setting.ml.configElement, platform)
}
