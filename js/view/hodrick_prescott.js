import HodrickPrescottFilter from '../../lib/model/hodrick_prescott.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	platform.setting.ml.reference = {
		title: 'Hodrick–Prescott filter (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Hodrick%E2%80%93Prescott_filter',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new HodrickPrescottFilter(l.value)
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
	controller.input.button('Calculate').on('click', fitModel)
}
