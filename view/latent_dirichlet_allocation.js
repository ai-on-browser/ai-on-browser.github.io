import LatentDirichletAllocation from '../lib/model/latent_dirichlet_allocation.js'

var dispLDA = function (elm, platform) {
	let model = null

	const fitModel = cb => {
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				const t = +elm.select('[name=topics]').property('value')
				model = new LatentDirichletAllocation(t)
				model.init(tx)
			}
			model.fit()
			pred_cb(model.predict().map(v => v + 1))
			cb && cb()
		})
	}

	elm.append('span').text('topics')
	elm.append('input').attr('type', 'number').attr('name', 'topics').attr('max', 100).attr('min', 1).attr('value', 5)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	dispLDA(platform.setting.ml.configElement, platform)
}
