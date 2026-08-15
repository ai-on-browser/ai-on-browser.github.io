import { DEMA } from '../../lib/model/dema.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	platform.setting.ml.reference = {
		title: 'Double exponential moving average (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Double_exponential_moving_average',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new DEMA(k.value)
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

	const k = controller.input.number({ label: 'k', min: 1, max: 100, value: 5 }).on('change', fitModel)
	controller.input.button('Calculate').on('click', fitModel)
}
