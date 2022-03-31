import LogarithmicInterpolation from '../../lib/model/logarithmic_interpolation.js'

var dispLI = function (elm, platform) {
	const calcLI = function () {
		let model = new LogarithmicInterpolation()
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcLI)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispLI(platform.setting.ml.configElement, platform)
}
