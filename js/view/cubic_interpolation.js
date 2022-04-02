import CubicInterpolation from '../../lib/model/cubic_interpolation.js'

var dispCubicInterpolation = function (elm, platform) {
	const calcCubicInterpolation = function () {
		let model = new CubicInterpolation()
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcCubicInterpolation)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispCubicInterpolation(platform.setting.ml.configElement, platform)
}
