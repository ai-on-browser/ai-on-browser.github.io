import MDS from '../../lib/model/mds.js'

var dispMDS = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Multidimensional scaling (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Multidimensional_scaling',
	}
	const fitModel = cb => {
		const dim = platform.dimension
		const y = new MDS().predict(platform.trainInput, dim)
		platform.trainResult = y
	}

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispMDS(platform.setting.ml.configElement, platform)
}
