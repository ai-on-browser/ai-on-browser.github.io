import TukeysFences from '../../lib/model/tukeys_fences.js'

var dispTukeysFences = function (elm, platform) {
	const calcTukeysFences = function () {
		const k = +elm.select('[name=k]').property('value')
		const model = new TukeysFences(k)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers
	}

	elm.append('span').text(' k = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'k')
		.attr('value', 1.5)
		.attr('min', 0)
		.attr('max', 50)
		.attr('step', 0.1)
		.on('change', calcTukeysFences)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcTukeysFences)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispTukeysFences(platform.setting.ml.configElement, platform)
}
