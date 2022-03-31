import AODE from '../../lib/model/aode.js'

var dispAODE = function (elm, platform) {
	const fitModel = () => {
		const discrete = +elm.select('[name=discrete]').property('value')
		const model = new AODE(discrete)

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories.map(v => v ?? -1))
	}

	elm.append('span').text(' Discrete ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'discrete')
		.attr('max', 100)
		.attr('min', 1)
		.attr('value', 10)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispAODE(platform.setting.ml.configElement, platform)
}
