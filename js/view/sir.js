import SlicedInverseRegression from '../../lib/model/sir.js'

var dispSIR = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Sliced inverse regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Sliced_inverse_regression',
	}
	const fitModel = () => {
		const s = +elm.select('[name=s]').property('value')
		const dim = platform.dimension
		const model = new SlicedInverseRegression(s)
		const y = model.predict(
			platform.trainInput,
			platform.trainOutput.map(v => v[0]),
			dim
		)
		platform.trainResult = y
	}

	elm.append('span').text(' s ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 's')
		.attr('value', 10)
		.attr('min', 1)
		.attr('max', 100)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispSIR(platform.setting.ml.configElement, platform)
}
