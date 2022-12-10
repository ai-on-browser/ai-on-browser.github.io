import Thompson from '../../lib/model/thompson.js'

var dispThompson = function (elm, platform) {
	platform.setting.ml.reference = {
		title: '外れ値 (Wikipedia)',
		url: 'https://ja.wikipedia.org/wiki/%E5%A4%96%E3%82%8C%E5%80%A4#%E3%83%88%E3%83%B3%E3%83%97%E3%82%BD%E3%83%B3%E6%A4%9C%E5%AE%9A',
	}
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
