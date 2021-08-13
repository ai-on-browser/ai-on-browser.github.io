import Isomap from '../model/isomap.js'

var dispIsomap = function (elm, platform) {
	const fitModel = cb => {
		const neighbors = +elm.select('[name=neighbors]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const dim = platform.dimension
			let y = Isomap(tx, dim, neighbors)
			pred_cb(y.toArray())
		})
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
