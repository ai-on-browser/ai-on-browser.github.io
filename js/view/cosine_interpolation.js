import CosineInterpolation from '../../lib/model/cosine_interpolation.js'

var dispCosineInterpolation = function (elm, platform) {
	const calcCosineInterpolation = function () {
		let model = new CosineInterpolation()
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcCosineInterpolation)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispCosineInterpolation(platform.setting.ml.configElement, platform)
}
