import AkimaInterpolation from '../../lib/model/akima.js'

var dispAkima = function (elm, platform) {
	const calcAkima = function () {
		const modified = elm.select('[name=modified]').property('value')
		const model = new AkimaInterpolation(modified === 'modified')
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('select')
		.attr('name', 'modified')
		.selectAll('option')
		.data(['', 'modified'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcAkima)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispAkima(platform.setting.ml.configElement, platform)
}
