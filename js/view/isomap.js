import Isomap from '../../lib/model/isomap.js'

var dispIsomap = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Isomap (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Isomap',
	}
	const fitModel = cb => {
		const neighbors = +elm.select('[name=neighbors]').property('value')
		const dim = platform.dimension
		const y = new Isomap(neighbors).predict(platform.trainInput, dim)
		platform.trainResult = y
	}

	elm.append('span').text(' neighbors = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'neighbors')
		.attr('value', 10)
		.attr('min', 0)
		.attr('max', 10000)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispIsomap(platform.setting.ml.configElement, platform)
}
