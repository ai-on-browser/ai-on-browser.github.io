import IsotonicRegression from '../../lib/model/isotonic.js'

var dispIsotonic = function (elm, platform) {
	const task = platform.task
	const fitModel = cb => {
		const dim = platform.datas.dimension
		const model = new IsotonicRegression()
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		platform.testResult(model.predict(platform.testInput(1).map(v => v[0])))
	}

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
	dispIsotonic(platform.setting.ml.configElement, platform)
}
