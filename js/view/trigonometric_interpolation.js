import TrigonometricInterpolation from '../../lib/model/trigonometric_interpolation.js'

var dispTrigonometric = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Trigonometric interpolation (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Trigonometric_interpolation',
	}
	const calcTrigonometric = function () {
		const model = new TrigonometricInterpolation()
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcTrigonometric)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispTrigonometric(platform.setting.ml.configElement, platform)
}
