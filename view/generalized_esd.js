import GeneralizedESD from '../lib/model/generalized_esd.js'

var dispGeneralizedESD = function (elm, platform) {
	const calcGeneralizedESD = function () {
		platform.fit((tx, ty, cb) => {
			const k = +elm.select('[name=k]').property('value')
			const alpha = +elm.select('[name=alpha]').property('value')
			const model = new GeneralizedESD(alpha, k)
			const outliers = model.predict(tx)
			cb(outliers)
		})
	}

	elm.append('span').text(' k = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('value', 5)
		.attr('min', 1)
		.attr('max', 100)
		.on('change', calcGeneralizedESD)
	elm.append('span').text(' alpha = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'alpha')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 50)
		.on('change', calcGeneralizedESD)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcGeneralizedESD)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispGeneralizedESD(platform.setting.ml.configElement, platform)
}
