import EPMA from '../../lib/model/epma.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new EPMA(n.value)
		const tx = platform.trainInput
		const pred = []
		for (let i = 0; i < tx.length; pred[i++] = []);
		for (let d = 0; d < tx[0].length; d++) {
			const xd = tx.map(v => v[d])
			const p = model.predict(xd)
			for (let i = 0; i < pred.length; i++) {
				pred[i][d] = p[i]
			}
		}
		platform.trainResult = pred
	}

	const n = controller.input.number({ label: 'n', min: 1, max: 100, value: 20 }).on('change', fitModel)
	controller.input.button('Calculate').on('click', fitModel)
}
