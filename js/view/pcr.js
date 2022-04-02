import PCR from '../../lib/model/pcr.js'

var dispPCR = function (elm, platform) {
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
