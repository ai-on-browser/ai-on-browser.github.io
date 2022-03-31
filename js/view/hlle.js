import HLLE from '../../lib/model/hlle.js'

var dispHLLE = function (elm, platform) {
	const fitModel = () => {
		const neighbor = +elm.select('[name=neighbor_size]').property('value')
		const dim = platform.dimension
		const y = new HLLE(neighbor).predict(platform.trainInput, dim)
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
	dispHLLE(platform.setting.ml.configElement, platform)
}
