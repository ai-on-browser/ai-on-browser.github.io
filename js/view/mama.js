import MAMA from '../../lib/model/mama.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new MAMA(fastLimit.value, slowLimit.value)
		const tx = platform.trainInput
		const pred = []
		for (let i = 0; i < tx.length; pred[i++] = []);
		for (let d = 0; d < tx[0].length; d++) {
			const xd = tx.map(v => v[d])
			const { mama, fama } = model.predict(xd)
			for (let i = 0; i < pred.length; i++) {
				pred[i][d] = method.value === 'mama' ? mama[i] : fama[i]
			}
		}
		platform.trainResult = pred
	}

	const method = controller.select({ label: 'method', values: ['mama', 'fama'] }).on('change', fitModel)
	const fastLimit = controller.input
		.number({ label: 'fast', min: 0, max: 1, step: 0.01, value: 0.5 })
		.on('change', fitModel)
	const slowLimit = controller.input
		.number({ label: 'slow', min: 0, max: 1, step: 0.01, value: 0.05 })
		.on('change', fitModel)
	controller.input.button('Calculate').on('click', fitModel)
}
