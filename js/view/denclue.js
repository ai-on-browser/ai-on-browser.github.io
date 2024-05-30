import DENCLUE from '../../lib/model/denclue.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'A. Hinneburg, H. H. Gabriel',
		title: 'DENCLUE 2.0: Fast Clustering based on Kernel Density Estimation',
		year: 2007,
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		model.fit()
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = model.size
	}

	const version = controller.select(['1', '2'])
	const h = controller.input.number({ label: ' h ', min: 0, max: 100, step: 0.1, value: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = new DENCLUE(h.value, +version.value)
			model.init(platform.trainInput)
			clusters.value = 0
			platform.init()
		})
		.step(fitModel)
		.epoch()
	const clusters = controller.text({ label: ' Clusters: ' })
}
