import ChangeFinder from '../../lib/model/change_finder.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.draft = true
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	let model = null
	const controller = new Controller(platform)

	const fitModel = (doFit = true) => {
		if (!model || doFit) {
			model = new ChangeFinder(p.value, r.value, smooth.value)
			const tx = platform.trainInput.map(v => v[0])
			model.fit(tx)
		}
		const pred = model.predict()
		platform.trainResult = pred
		platform.threshold = threshold.value
	}

	const method = controller.select(['sdar'])
	const p = controller.input.number({ label: 'p', min: 1, max: 1000, value: 2 })
	const r = controller.input.number({ label: 'r', min: 0, max: 1, step: 0.1, value: 0.5 })
	const smooth = controller.input.number({ label: 'smooth', min: 1, max: 100, value: 10 })
	controller.input.button('Fit').on('click', () => fitModel())
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 100, step: 0.1, value: 0.8 })
		.on('change', () => {
			fitModel(false)
		})
}
