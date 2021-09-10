import KernelKMeans from '../lib/model/kernel_kmeans.js'

var dispKKMeans = function (elm, platform) {
	let model = null

	elm.append('span').text(' k ')
	elm.append('input').attr('type', 'number').attr('name', 'k').attr('min', 1).attr('max', 100).attr('value', 3)
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			const k = +elm.select('[name=k]').property('value')
			model = new KernelKMeans(k)
			platform.fit((tx, ty, pred_cb) => {
				model.init(tx)
				const pred = model.predict()
				pred_cb(pred.map(v => v + 1))
			})
		})
		.step(() => {
			model.fit()
			platform.fit((tx, ty, pred_cb) => {
				const pred = model.predict()
				pred_cb(pred.map(v => v + 1))
			})
		})
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispKKMeans(platform.setting.ml.configElement, platform)
}
