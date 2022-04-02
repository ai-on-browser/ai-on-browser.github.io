import LOWESS from '../../lib/model/lowess.js'

var dispLOWESS = function (elm, platform) {
	const fitModel = cb => {
		const model = new LOWESS()
		model.fit(platform.trainInput, platform.trainOutput)
		platform.testResult(model.predict(platform.testInput(10)))
	}

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLOWESS(platform.setting.ml.configElement, platform)
}
