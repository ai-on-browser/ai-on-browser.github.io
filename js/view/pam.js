import PAM from '../../lib/model/pam.js'
import CLARA from '../../lib/model/clara.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			if (type.value === 'PAM') {
				model = new PAM(clusters.value)
			} else if (type.value === 'CLARA') {
				model = new CLARA(clusters.value)
			}
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
	}

	const type = controller.select(['PAM', 'CLARA'])
	const clusters = controller.input.number({ label: ' clusters ', min: 1, max: 1000, value: 10 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
		})
		.step(fitModel)
		.epoch()
}
