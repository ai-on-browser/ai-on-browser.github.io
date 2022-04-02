import KernelKMeans from '../../lib/model/kernel_kmeans.js'
import Controller from '../controller.js'

var dispKKMeans = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	elm.append('span').text(' k ')
	elm.append('input').attr('type', 'number').attr('name', 'k').attr('min', 1).attr('max', 100).attr('value', 3)
	controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			const k = +elm.select('[name=k]').property('value')
			model = new KernelKMeans(k)
			model.init(platform.trainInput)
			const pred = model.predict()
			platform.trainResult = pred.map(v => v + 1)
		})
		.step(() => {
			model.fit()
			const pred = model.predict()
			platform.trainResult = pred.map(v => v + 1)
		})
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispKKMeans(platform.setting.ml.configElement, platform)
}
