import SecondOrderPerceptron from '../../lib/model/sop.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispSOP = function (elm, platform) {
	const calc = () => {
		const method = elm.select('[name=method]').property('value')
		const a = +elm.select('[name=a]').property('value')
		const model = new EnsembleBinaryModel(function () {
			return new SecondOrderPerceptron(a)
		}, method)
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
	elm.append('span').text(' a = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'a')
		.attr('min', 0)
		.attr('max', 10)
		.attr('value', 1)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSOP(platform.setting.ml.configElement, platform)
}
