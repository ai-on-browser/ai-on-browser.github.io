import AffinityPropagation from '../../lib/model/affinity_propagation.js'

var dispAffinityPropagation = function (elm, platform) {
	let model = null

	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				model = new AffinityPropagation()
				model.init(tx)
			}
			model.fit()
			const pred = model.predict()
			pred_cb(pred.map(v => v + 1))
			elm.select('[name=clusters]').text(model.size)
			platform.centroids(
				model.centroids,
				model.categories.map(v => v + 1)
			)
			cb && cb()
		})
	}

	platform.setting.ml.controller
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
