import Thompson from '../../lib/model/thompson.js'

var dispThompson = function (elm, platform) {
	const calcThompson = function () {
		const alpha = +elm.select('[name=alpha]').property('value')
		const model = new Thompson(alpha)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers
	}

	elm.append('span').text(' alpha = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'alpha')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 50)
		.on('change', calcThompson)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcThompson)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispThompson(platform.setting.ml.configElement, platform)
}
