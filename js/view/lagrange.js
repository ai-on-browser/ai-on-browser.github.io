import LagrangeInterpolation from '../../lib/model/lagrange.js'

var dispLagrange = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Lagrange polynomial (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Lagrange_polynomial',
	}
	const calcLagrange = function () {
		const method = elm.select('[name=method]').property('value')
		let model = new LagrangeInterpolation(method)
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(2).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['', 'weighted', 'newton'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcLagrange)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispLagrange(platform.setting.ml.configElement, platform)
}
