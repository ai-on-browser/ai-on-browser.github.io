import DemingRegression from '../../lib/model/deming.js'

var dispDeming = function (elm, platform) {
	const fitModel = () => {
		const d = +elm.select('[name=d]').property('value')
		const model = new DemingRegression(d)
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		platform.testResult(model.predict(platform.testInput(1).map(v => v[0])))
	}

	elm.append('span').text(' d ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'd')
		.attr('value', 1)
		.attr('min', 0)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispDeming(platform.setting.ml.configElement, platform)
}
