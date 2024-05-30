import ARMA from '../../lib/model/arma.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	const controller = new Controller(platform)
	let model = null
	const fitModel = () => {
		const tx = platform.trainInput
		if (!model) {
			model = []
			for (let d = 0; d < tx[0].length; d++) {
				model[d] = new ARMA(p.value, q.value)
			}
		}
		const pred = []
		for (let i = 0; i < c.value; pred[i++] = []);
		for (let d = 0; d < tx[0].length; d++) {
			const xd = tx.map(v => v[d])
			model[d].fit(xd)
			const p = model[d].predict(xd, c.value)
			for (let i = 0; i < pred.length; i++) {
				pred[i][d] = p[i]
			}
		}
		platform.trainResult = pred
	}

	const p = controller.input.number({ label: 'p', min: 0, max: 1000, value: 1 })
	const q = controller.input.number({ label: 'q', min: 0, max: 1000, value: 1 })

	controller
		.stepLoopButtons()
		.init(() => {
			model = null
			platform.resetPredicts()
		})
		.step(fitModel)
		.epoch()

	const c = controller.input
		.number({ label: 'predict count', min: 1, max: 100, value: 100 })
		.on('change', () => fitModel())
}
