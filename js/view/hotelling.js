import Hotelling from '../../lib/model/hotelling.js'

var dispHotelling = function (elm, platform) {
	const calcHotelling = function () {
		const threshold = +elm.select('[name=threshold]').property('value')
		const model = new Hotelling()
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
			calcHotelling()
		})
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcHotelling)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispHotelling(platform.setting.ml.configElement, platform)
}
