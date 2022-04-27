import Matrix from '../../lib/util/matrix.js'

import Histogram from '../../lib/model/histogram.js'

var dispHistogram = function (elm, platform) {
	const fitModel = () => {
		const method = elm.select('[name=method]').property('value')
		const bins = +elm.select('[name=bins]').property('value')
		const width = platform.width
		const height = platform.height
		const d = new Histogram({
			domain: platform.datas.domain,
			count: method !== 'manual' ? null : bins,
			binMethod: method,
		}).fit(platform.trainInput)

		platform.testInput([width / d.length, height / d[0].length])
		let pred = Matrix.fromArray(d)
		pred.div(pred.max())
		pred = pred.value.map(specialCategory.density)
		platform.testResult(pred)
	}

	elm.append('select')
		.attr('name', 'method')
		.on('change', () => {
			const method = elm.select('[name=method]').property('value')
			elm.select('[name=bins]').property('disabled', method !== 'manual')
			fitModel()
		})
		.selectAll('option')
		.data(['manual', 'fd', 'scott', 'rice', 'sturges', 'doane', 'sqrt'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text('bins ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'bins')
		.attr('min', 2)
		.attr('value', 10)
		.on('change', fitModel)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispHistogram(platform.setting.ml.configElement, platform)
}
