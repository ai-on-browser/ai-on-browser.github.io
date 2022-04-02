import LinearInterpolation from '../../lib/model/lerp.js'

var dispLerp = function (elm, platform) {
	const calcLerp = function () {
		let model = new LinearInterpolation()
		model.fit(
			platform.trainInput.map(v => v[0]),
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
	dispLerp(platform.setting.ml.configElement, platform)
}
