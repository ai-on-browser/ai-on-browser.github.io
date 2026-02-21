import SDAR from '../../lib/model/sdar.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.draft = true
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	const controller = new Controller(platform)
	const fitModel = () => {
		const tx = platform.trainInput
		const model = new SDAR(p.value)
		const pred = []
		for (let i = 0; i < c.value; pred[i++] = []);
		for (let d = 0; d < tx[0].length; d++) {
			const xd = tx.map(v => v[d])
			const p = model.predict(xd, c.value)
			for (let i = 0; i < pred.length; i++) {
				pred[i][d] = p[i]
			}
		}
		platform.trainResult = pred
	}

	const p = controller.input.number({ label: 'p', min: 1, max: 1000, value: 1 })
	controller.input.button('Fit').on('click', fitModel)
	const c = controller.input.number({ label: 'predict count', min: 1, max: 100, value: 100 }).on('change', fitModel)
}
