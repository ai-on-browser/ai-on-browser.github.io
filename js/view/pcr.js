import PCR from '../../lib/model/pcr.js'

var dispPCR = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Principal component regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Principal_component_regression',
	}
	const fitModel = cb => {
		const dim = platform.datas.dimension
		const model = new PCR()
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(dim === 1 ? 100 : 4))
		platform.testResult(pred)
	}

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPCR(platform.setting.ml.configElement, platform)
}
