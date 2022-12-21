import CURE from '../../lib/model/cure.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'CURE algorithm (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/CURE_algorithm',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new CURE(c.value)
		model.fit(platform.trainInput)
		const pred = model.predict(k.value)
		platform.trainResult = pred.map(v => v + 1)
	}

	const c = controller.input.number({ label: ' c ', min: 1, max: 1000, value: 10 })
	const k = controller.input.number({ label: ' k ', min: 1, max: 100, value: 3 })
	controller.input.button('Fit').on('click', fitModel)
}
