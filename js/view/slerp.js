import Slerp from '../../lib/model/slerp.js'

var dispSlerp = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Slerp (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Slerp',
	}
	const calcSlerp = function () {
		const o = +elm.select('[name=o]').property('value')
		let model = new Slerp(o)
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('span').text(' o ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'o')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', calcSlerp)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcSlerp)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSlerp(platform.setting.ml.configElement, platform)
}
