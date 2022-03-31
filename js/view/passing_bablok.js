import PassingBablok from '../../lib/model/passing_bablok.js'

var dispPB = function (elm, platform) {
	const fitModel = cb => {
		const dim = platform.datas.dimension
		const model = new PassingBablok()
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainInput.map(v => v[0])
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
	dispPB(platform.setting.ml.configElement, platform)
}
