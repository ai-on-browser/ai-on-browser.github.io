import RepeatedMedianRegression from '../../lib/model/rmr.js'

var dispRMR = function (elm, platform) {
	const fitModel = cb => {
		const dim = platform.datas.dimension
		const model = new RepeatedMedianRegression()
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
	dispRMR(platform.setting.ml.configElement, platform)
}
