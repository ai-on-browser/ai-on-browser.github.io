import PA from '../../lib/model/passive_aggressive.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispPA = function (elm, platform) {
	const calc = () => {
		const method = elm.select('[name=method]').property('value')
		const version = +elm.select('[name=version]').property('value')
		const model = new EnsembleBinaryModel(function () {
			return new PA(version)
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
	elm.append('select')
		.attr('name', 'version')
		.selectAll('option')
		.data([
			['PA', 0],
			['PA-1', 1],
			['PA-2', 2],
		])
		.enter()
		.append('option')
		.property('value', d => d[1])
		.text(d => d[0])
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispPA(platform.setting.ml.configElement, platform)
}
