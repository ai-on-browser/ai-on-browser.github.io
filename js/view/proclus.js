import PROCLUS from '../../lib/model/proclus.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		if (!model) {
			model = new PROCLUS(clusters.value, a.value, b.value, l.value, mindev.value)
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
	}

	const clusters = controller.input.number({ label: ' clusters ', min: 1, max: 1000, value: 10 })
	const a = controller.input.number({ label: ' A ', min: 1, max: 1000, value: 20 })
	const b = controller.input.number({ label: ' B ', min: 1, max: 1000, value: 10 })
	const l = controller.input.number({ label: ' l ', min: 1, max: 1000, value: 3 })
	const mindev = controller.input.number({ label: ' minDeviation ', min: 0, max: 1, step: 0.1, value: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
		})
		.step(fitModel)
		.epoch()
}
