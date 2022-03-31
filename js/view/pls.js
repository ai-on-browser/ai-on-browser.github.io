import PLS from '../../lib/model/pls.js'

var dispPLS = function (elm, platform) {
	const fitModel = cb => {
		const dim = platform.datas.dimension
		const l = +elm.select('[name=l]').property('value')
		const model = new PLS(l)
		model.init(platform.trainInput, platform.trainOutput)
		model.fit()

		const pred = model.predict(platform.testInput(dim === 1 ? 100 : 4))
		platform.testResult(pred)
	}

	elm.append('span').text(' l = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'l')
		.attr('min', 1)
		.attr('max', platform.datas.dimension)
		.attr('value', platform.datas.dimension)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPLS(platform.setting.ml.configElement, platform)
}
