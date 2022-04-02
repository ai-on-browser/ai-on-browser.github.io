import SegmentedRegression from '../../lib/model/segmented.js'

var dispSegmentedRegression = function (elm, platform) {
	const fitModel = () => {
		const s = +elm.select('[name=s]').property('value')
		const model = new SegmentedRegression(s)
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(1))
		platform.testResult(pred)
	}

	elm.append('span').text('Segments ')
	elm.append('input').attr('type', 'number').attr('name', 's').attr('min', 1).attr('max', 10).attr('value', 3)
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
	dispSegmentedRegression(platform.setting.ml.configElement, platform)
}
