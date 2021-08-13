import RandomProjection from '../model/random_projection.js'

var dispRandomProjection = function (elm, platform) {
	const fitModel = cb => {
		const init = elm.select('[name=init]').property('value')
		platform.fit((tx, ty, pred_cb) => {
			const dim = platform.dimension
			let y = RandomProjection(tx, dim, init)
			pred_cb(y.toArray())
		})
	}

	elm.append('select')
		.attr('name', 'init')
		.selectAll('option')
		.data(['uniform', 'normal', 'root3'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispRandomProjection(platform.setting.ml.configElement, platform)
}
