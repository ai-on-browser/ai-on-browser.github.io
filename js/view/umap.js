import UMAP from '../../lib/model/umap.js'
import Controller from '../controller.js'

var dispUMAP = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		if (model === null) {
			cb && cb()
			return
		}
		platform.fit((tx, ty, pred_cb) => {
			const y = model.fit()
			pred_cb(y)

			cb && cb()
		})
	}

	elm.append('span').text(' n = ')
	elm.append('input').attr('type', 'number').attr('name', 'n').attr('value', 10).attr('min', 1).attr('max', 100)
	elm.append('span').text(' min-dist = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'min-dist')
		.attr('value', 1)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
	controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			const dim = platform.dimension
			const n = +elm.select('[name=n]').property('value')
			const mindist = +elm.select('[name=min-dist]').property('value')
			platform.fit((tx, ty, pred_cb) => {
				model = new UMAP(tx, dim, n, mindist)
			})
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Then, click "Step" button repeatedly.'
	dispUMAP(platform.setting.ml.configElement, platform)
}
