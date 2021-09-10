import SmirnovGrubbs from '../lib/model/smirnov_grubbs.js'

var dispSmirnovGrubbs = function (elm, platform) {
	const calcSmirnovGrubbs = function () {
		platform.fit((tx, ty, cb) => {
			const alpha = +elm.select('[name=alpha]').property('value')
			const model = new SmirnovGrubbs(alpha)
			const outliers = model.predict(tx)
			cb(outliers)
		})
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
