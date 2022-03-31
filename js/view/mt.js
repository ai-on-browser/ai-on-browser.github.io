import MT from '../../lib/model/mt.js'

var dispMT = function (elm, platform) {
	const calcMT = function () {
		const threshold = +elm.select('[name=threshold]').property('value')
		const model = new MT()
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
			calcMT()
		})
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcMT)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispMT(platform.setting.ml.configElement, platform)
}
