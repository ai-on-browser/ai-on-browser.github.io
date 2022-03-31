import CubicHermiteSpline from '../../lib/model/cubic_hermite_spline.js'

var dispCubicHermiteSpline = function (elm, platform) {
	const calcCubicHermiteSpline = function () {
		const tension = +elm.select('[name=tension]').property('value')
		const bias = +elm.select('[name=bias]').property('value')
		let model = new CubicHermiteSpline(tension, bias)
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('span').text(' tension ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'tension')
		.attr('value', 0)
		.attr('min', -1)
		.attr('max', 1)
		.attr('step', 0.1)
		.on('change', calcCubicHermiteSpline)
	elm.append('span').text(' bias ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'bias')
		.attr('value', 0)
		.attr('min', -100)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', calcCubicHermiteSpline)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcCubicHermiteSpline)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispCubicHermiteSpline(platform.setting.ml.configElement, platform)
}
