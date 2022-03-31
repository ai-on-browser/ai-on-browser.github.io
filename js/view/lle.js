import LLE from '../../lib/model/lle.js'

var dispLLE = function (elm, platform) {
	const fitModel = cb => {
		const neighbor = +elm.select('[name=neighbor_size]').property('value')
		const dim = platform.dimension
		const y = new LLE(neighbor).predict(platform.trainInput, dim)
		platform.trainResult = y
	}

	elm.append('span')
		.text('Select neighbor #')
		.append('input')
		.attr('type', 'number')
		.attr('name', 'neighbor_size')
		.attr('value', 20)
		.attr('min', 1)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispLLE(platform.setting.ml.configElement, platform)
}
