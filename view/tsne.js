import { SNE, tSNE } from '../model/tsne.js'

var dispTSNE = function (elm, platform) {
	let model = null

	const fitModel = cb => {
		if (model === null) {
			cb && cb()
			return
		}
		platform.fit((tx, ty, pred_cb) => {
			let y = model.fit()
			pred_cb(y.toArray())

			cb && cb()
		})
	}

	elm.append('select')
		.attr('name', 'type')
		.selectAll('option')
		.data(['SNE', 'tSNE'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			const dim = platform.dimension
			const type = elm.select('[name=type]').property('value')
			if (type === 'SNE') {
				model = new SNE(platform.datas.x, dim)
			} else {
				model = new tSNE(platform.datas.x, dim)
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