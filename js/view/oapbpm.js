import OAPBPM from '../../lib/model/oapbpm.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ml.reference = {
		author: 'R. F. Harrington',
		title: 'Online Ranking/Collaborative filtering using the Perceptron Algorithm',
		year: 2003,
	}
	const controller = new Controller(platform)

	let model = null
	const fitModel = () => {
		if (!model) {
			return
		}

		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred)
	}

	const n = controller.input.number({ label: ' N ', value: 10, min: 1, max: 100 })
	const tau = controller.input.number({ label: ' Tau ', value: 0.5, min: 0, max: 1, step: 0.1 })
	const rate = controller.input.number({ label: ' Learning rate ', value: 0.1, min: 0, max: 100, step: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = new OAPBPM(n.value, tau.value, rate.value)
			platform.init()
		})
		.step(fitModel)
		.epoch()
}
