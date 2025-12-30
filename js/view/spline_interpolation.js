import SplineInterpolation from '../../lib/model/spline_interpolation.js'

var dispSI = (elm, platform) => {
	platform.setting.ml.reference = {
		title: 'Spline interpolation (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Spline_interpolation',
	}
	const calcLerp = () => {
		const model = new SplineInterpolation()
		const data = platform.trainInput.map(v => v[0])
		model.fit(
			data,
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcLerp)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispSI(platform.setting.ml.configElement, platform)
}
