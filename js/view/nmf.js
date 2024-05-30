import NMF from '../../lib/model/nmf.js'

import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (platform.task === 'CT') {
			if (!model) {
				model = new NMF()
				model.init(platform.trainInput, size.value)
			}
			model.fit()
			const pred = Matrix.fromArray(model.predict())
			platform.trainResult = pred.argmax(1).value.map(v => v + 1)
		} else {
			if (!model) {
				model = new NMF()
				const dim = platform.dimension
				model.init(platform.trainInput, dim)
			}
			model.fit()
			const pred = model.predict()
			platform.trainResult = pred
		}
	}

	let size = null
	if (platform.task === 'CT') {
		size = controller.input.number({ label: ' Size ', min: 1, max: 100, value: 10 })
	}
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
