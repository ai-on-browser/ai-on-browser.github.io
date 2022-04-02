import AffinityPropagation from '../../lib/model/affinity_propagation.js'
import Controller from '../controller.js'

var dispAffinityPropagation = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		if (!model) {
			model = new AffinityPropagation()
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		elm.select('[name=clusters]').text(model.size)
		platform.centroids(
			model.centroids,
			model.categories.map(v => v + 1)
		)
		cb && cb()
	}

	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			elm.select('[name=clusters]').text(0)
			platform.init()
		})
		.step(fitModel)
		.epoch()
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispAffinityPropagation(platform.setting.ml.configElement, platform)
}
