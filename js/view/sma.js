import SMARegression from '../../lib/model/sma.js'

var dispSMA = (elm, platform) => {
	const fitModel = () => {
		const model = new SMARegression()
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
	dispSMA(platform.setting.ml.configElement, platform)
}
