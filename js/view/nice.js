import NICE from '../../lib/model/nice.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		if (!model) {
			model = new NICE(hiddens.value)
		}
		model.fit(platform.trainInput, 1, lr.value, 10)

		const y = Matrix.randn(500, platform.trainInput[0].length, 0, 1).toArray()
		platform.trainResult = model.generate(y)
	}

	const hiddens = controller.input.number({ label: ' hidden nodes ', min: 1, max: 100, value: 4 })
	const lr = controller.input.number({ label: ' learning rate ', min: 0.001, max: 10, step: 0.001, value: 0.001 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
