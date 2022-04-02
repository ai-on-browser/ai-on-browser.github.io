import MAD from '../../lib/model/mad.js'

var dispMAD = function (elm, platform) {
	const calcMAD = function () {
		const threshold = +elm.select('[name=threshold]').property('value')
		const model = new MAD()
		model.fit(platform.trainInput)
		const outliers = model.predict(platform.trainInput).map(v => v > threshold)
		platform.trainResult = outliers
		const outlier_tiles = model.predict(platform.testInput(3)).map(v => v > threshold)
		platform.testResult(outlier_tiles)
	}

	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 2)
		.attr('min', 0)
		.attr('max', 10)
		.property('required', true)
		.attr('step', 0.1)
		.on('change', function () {
			calcMAD()
		})
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcMAD)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispMAD(platform.setting.ml.configElement, platform)
}
