import KSVD from '../../lib/model/ksvd.js'
import Controller from '../controller.js'

var dispKSVD = function (elm, platform) {
	platform.setting.ml.reference = {
		author: 'R. Rubinstein, M. Zibulevsky, M. Elad',
		title: 'Efficient Implementation of the K-SVD Algorithm using Batch Orthogonal Matching Pursuit',
		year: 2008,
	}
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		const dim = platform.dimension
		if (!model) {
			model = new KSVD(platform.trainInput, dim)
		}
		model.fit()
		const pred = model.predict()
		platform.trainResult = pred
		cb && cb()
	}
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispKSVD(platform.setting.ml.configElement, platform)
}
