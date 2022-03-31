import RandomProjection from '../../lib/model/random_projection.js'

var dispRandomProjection = function (elm, platform) {
	const fitModel = cb => {
		const init = elm.select('[name=init]').property('value')
		const dim = platform.dimension
		const model = new RandomProjection(init)
		const y = model.predict(platform.trainInput, dim)
		platform.trainResult = y
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
