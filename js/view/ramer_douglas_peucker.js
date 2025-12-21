import RamerDouglasPeucker from '../../lib/model/ramer_douglas_peucker.js'

var dispRDP = (elm, platform) => {
	platform.setting.ml.reference = {
		title: 'Ramer-Douglas-Peucker algorithm (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm',
	}
	const fitModel = () => {
		const e = +elm.select('[name=e]').property('value')
		const model = new RamerDouglasPeucker(e)
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		platform.testResult(model.predict(platform.testInput(1).map(v => v[0])))
	}

	elm.append('span').text(' e ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'e')
		.attr('value', 0.1)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispRDP(platform.setting.ml.configElement, platform)
}
