import Sammon from '../../lib/model/sammon.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Sammon mapping (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Sammon_mapping',
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		const dim = platform.dimension
		if (!model) {
			model = new Sammon(platform.trainInput, dim)
		}
		const pred = model.fit()
		platform.trainResult = pred
	}
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
}
