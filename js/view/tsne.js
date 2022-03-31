import { SNE, tSNE } from '../../lib/model/tsne.js'
import Controller from '../controller.js'

var dispTSNE = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		if (model === null) {
			cb && cb()
			return
		}
		const y = model.fit()
		platform.trainResult = y

		cb && cb()
	}

	elm.append('select')
		.attr('name', 'type')
		.selectAll('option')
		.data(['SNE', 'tSNE'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			const dim = platform.dimension
			const type = elm.select('[name=type]').property('value')
			if (type === 'SNE') {
				model = new SNE(platform.trainInput, dim)
			} else {
				model = new tSNE(platform.trainInput, dim)
			}
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Then, click "Step" button repeatedly.'
	dispTSNE(platform.setting.ml.configElement, platform)
}
