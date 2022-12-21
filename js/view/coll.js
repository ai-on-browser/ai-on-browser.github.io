import COLL from '../../lib/model/coll.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'C. D. Wang, J. H. Lai, J. Y. Zhu',
		title: 'A Conscience On-line Learning Approach for Kernel-Based Clustering',
		year: 2010,
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			model = new COLL(k.value)
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict(k.value)
		platform.trainResult = pred.map(v => v + 1)
	}

	const k = controller.input.number({ label: ' k ', min: 1, max: 1000, value: 3 }).on('change', fitModel)
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
