import SmirnovGrubbs from '../../lib/model/smirnov_grubbs.js'

var dispSmirnovGrubbs = function (elm, platform) {
	platform.setting.ml.reference = {
		title: "Grubbs's test (Wikipedia)",
		url: 'https://en.wikipedia.org/wiki/Grubbs%27s_test',
	}
	const calcSmirnovGrubbs = function () {
		const alpha = +elm.select('[name=alpha]').property('value')
		const model = new SmirnovGrubbs(alpha)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers
	}

	elm.append('span').text(' alpha = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'alpha')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 10)
		.on('change', calcSmirnovGrubbs)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcSmirnovGrubbs)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSmirnovGrubbs(platform.setting.ml.configElement, platform)
}
