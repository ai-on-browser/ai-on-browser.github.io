import { ProbabilisticPCA } from '../../lib/model/probabilistic_pca.js'

var dispPPCA = function (elm, platform) {
	let model = null
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			if (!model) {
				const dim = platform.dimension
				const method = elm.select('[name=method]').property('value')
				model = new ProbabilisticPCA(method, dim)
			}
			model.fit(tx)
			const y = model.predict(tx)
			pred_cb(y)
		})
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['analysis', 'em', 'bayes'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
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
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPPCA(platform.setting.ml.configElement, platform)
}
