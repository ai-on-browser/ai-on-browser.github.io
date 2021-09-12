import TietjenMoore from '../../lib/model/tietjen_moore.js'

var dispTietjenMoore = function (elm, platform) {
	const calcTietjenMoore = function () {
		platform.fit((tx, ty, cb) => {
			const k = +elm.select('[name=k]').property('value')
			const threshold = +elm.select('[name=threshold]').property('value')
			const model = new TietjenMoore(k)
			const outliers = model.predict(tx, threshold)
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
		.on('change', calcTietjenMoore)
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 0.2)
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.1)
		.on('change', calcTietjenMoore)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcTietjenMoore)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispTietjenMoore(platform.setting.ml.configElement, platform)
}
