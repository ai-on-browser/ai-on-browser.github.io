import Banditron from '../../lib/model/banditron.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step".'
	platform.setting.ml.reference = {
		author: 'S. M. Kakade, S. Shalev-Shwartz, A. Tewari',
		title: 'Efficient Bandit Algorithms for Online Multiclass Prediction',
		year: 2008,
	}
	const controller = new Controller(platform)
	let model = null
	const calc = cb => {
		if (!model) {
			model = new Banditron(gamma.value)
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)

		const categories = model.predict(platform.testInput(3))
		platform.testResult(categories)
		cb && cb()
	}

	const gamma = controller.input.number({ label: ' gamma ', min: 0, max: 0.5, step: 0.1, value: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.init()
		})
		.step(calc)
		.epoch()
}
