import DiffusionMap from '../../lib/model/diffusion_map.js'

var dispDM = function (elm, platform) {
	elm.append('span')
		.text('t')
		.append('input')
		.attr('type', 'number')
		.attr('name', 't')
		.attr('value', 2)
		.attr('min', 1)
		.attr('max', 100)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => {
			const t = +elm.select('[name=t]').property('value')
			platform.fit((tx, ty, pred_cb) => {
				const dim = platform.dimension
				const y = new DiffusionMap(t).predict(tx, dim)
				pred_cb(y)
			})
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispDM(platform.setting.ml.configElement, platform)
}
