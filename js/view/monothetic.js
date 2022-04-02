import MonotheticClustering from '../../lib/model/monothetic.js'

var dispMonothetic = function (elm, platform) {
	let model = null

	const fitModel = cb => {
		if (!model) {
			model = new MonotheticClustering()
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		elm.select('[name=clusters]').text(model.size)
		cb && cb()
	}

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Initialize')
		.on('click', () => {
			model = null
			elm.select('[name=clusters]').text(0)
		})
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Step')
		.on('click', () => {
			fitModel()
		})
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispMonothetic(platform.setting.ml.configElement, platform)
}
