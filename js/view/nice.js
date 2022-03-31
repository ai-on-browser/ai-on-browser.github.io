import NICE from '../../lib/model/nice.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

var dispNICE = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null
	const fitModel = cb => {
		if (!model) {
			const hiddens = +elm.select('[name=hiddens]').property('value')
			model = new NICE(hiddens)
		}
		const lr = +elm.select('[name=lr]').property('value')
		model.fit(platform.trainInput, 1, lr, 10)

		const y = Matrix.randn(500, platform.trainInput[0].length, 0, 1).toArray()
		platform.trainResult = model.generate(y)
		cb && cb()
	}

	elm.append('span').text(' hidden nodes ')
	elm.append('input').attr('type', 'number').attr('name', 'hiddens').attr('min', 1).attr('max', 100).attr('value', 4)
	elm.append('span').text(' learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'lr')
		.attr('min', 0.001)
		.attr('max', 10)
		.attr('step', 0.001)
		.attr('value', 0.001)
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
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	dispNICE(platform.setting.ml.configElement, platform)
}
