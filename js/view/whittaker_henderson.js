import WhittakerHendersonSmoothing from '../../lib/model/whittaker_henderson.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	platform.setting.ml.reference = {
		title: 'Whittaker–Henderson smoothing (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Whittaker%E2%80%93Henderson_smoothing',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new WhittakerHendersonSmoothing(l.value, p.value)
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

	const l = controller.input.number({ label: 'lambda', min: 1, max: 10000, value: 100 }).on('change', fitModel)
	const p = controller.input.number({ label: 'p', min: 1, max: 100, value: 3 }).on('change', fitModel)
	controller.input.button('Calculate').on('click', fitModel)
}
