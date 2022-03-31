import NMF from '../../lib/model/nmf.js'

import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

var dispNMF = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		if (platform.task === 'CT') {
			if (!model) {
				model = new NMF()
				const k = +elm.select('[name=k]').property('value')
				model.init(platform.trainInput, k)
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
		cb && cb()
	}

	if (platform.task === 'CT') {
		elm.append('span').text(' Size ')
		elm.append('input').attr('type', 'number').attr('name', 'k').attr('value', 10).attr('min', 1).attr('max', 100)
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

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispNMF(platform.setting.ml.configElement, platform)
}
