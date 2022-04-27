import RecursiveLeastSquares from '../../lib/model/rls.js'
import EnsembleBinaryModel from '../../lib/model/ensemble_binary.js'

var dispRLS = function (elm, platform) {
	const calc = () => {
		let model = null
		if (platform.task === 'CF') {
			const method = elm.select('[name=method]').property('value')
			model = new EnsembleBinaryModel(RecursiveLeastSquares, method)
		} else {
			model = new RecursiveLeastSquares()
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
	}

	if (platform.task === 'CF') {
		elm.append('select')
			.attr('name', 'method')
			.selectAll('option')
			.data(['oneone', 'onerest'])
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
	}
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispRLS(platform.setting.ml.configElement, platform)
}
