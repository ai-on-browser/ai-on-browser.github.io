import SmoothingSpline from '../../lib/model/spline.js'

var dispSpline = (elm, platform) => {
	platform.setting.ml.reference = {
		title: 'Smoothing spline (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Smoothing_spline',
	}
	const calcSpline = () => {
		const l = +lmb.property('value')
		const model = new SmoothingSpline(l)
		const data = platform.trainInput.map(v => v[0])
		model.fit(
			data,
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(2).map(v => v[0]))
		platform.testResult(pred)
	}

	const lmb = elm
		.append('input')
		.attr('type', 'number')
		.attr('name', 'lambda')
		.attr('min', 0)
		.attr('value', 0.01)
		.attr('step', 0.01)
		.on('change', calcSpline)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcSpline)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispSpline(platform.setting.ml.configElement, platform)
}
