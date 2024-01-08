import BRIDGE from '../../lib/model/bridge.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'M. Dash, H. Liu, X. Xu',
		title: '1 + 1 > 2: Merging distance and density based clustering',
		year: 2001,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new BRIDGE(k.value, e_core.value, e_den.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = new Set(pred).size
	}

	const k = controller.input.number({ label: 'k', min: 1, max: 100, value: 5 }).on('change', fitModel)
	const e_core = controller.input
		.number({ label: 'e-core', min: 0, max: 10, value: 0.1, step: 0.01 })
		.on('change', fitModel)
	const e_den = controller.input
		.number({ label: 'e density', min: 0, max: 10, value: 0.05, step: 0.01 })
		.on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}
