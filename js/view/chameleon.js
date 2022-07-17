import CHAMELEON from '../../lib/model/chameleon.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		model = new CHAMELEON(n.value)
		model.fit(platform.trainInput)
		const pred = model.predict(k.value)
		platform.trainResult = pred.map(v => v + 1)
	}

	const n = controller.input.number({ label: 'n', min: 1, max: 100, value: 5 })
	controller.input.button('Fit').on('click', fitModel)
	const k = controller.input
		.number({
			label: 'k',
			min: 1,
			max: 100,
			value: 10,
		})
		.on('change', () => {
			if (!model) {
				return
			}
			const pred = model.predict(k.value)
			platform.trainResult = pred.map(v => v + 1)
		})
}
