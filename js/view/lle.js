import LLE from '../../lib/model/lle.js'

var dispLLE = function (elm, platform) {
	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			const neighbor = +elm.select('[name=neighbor_size]').property('value')
			const dim = platform.dimension
			const y = LLE(tx, neighbor, dim)
			pred_cb(y)
		})
	}

	elm.append('span')
		.text('Select neighbor #')
		.append('input')
		.attr('type', 'number')
		.attr('name', 'neighbor_size')
		.attr('value', 2)
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
