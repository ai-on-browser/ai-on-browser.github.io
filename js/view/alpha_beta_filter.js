import AlphaBetaFilter from '../../lib/model/alpha_beta_filter.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	platform.setting.ml.reference = {
		title: 'Alpha beta filter (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Alpha_beta_filter',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new AlphaBetaFilter(a.value, b.value)
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

	const a = controller.input.number({ label: 'alpha', min: 0, max: 1, step: 0.01, value: 0.2 }).on('change', fitModel)
	const b = controller.input.number({ label: 'beta', min: 0, max: 2, step: 0.01, value: 0.01 }).on('change', fitModel)
	controller.input.button('Calculate').on('click', fitModel)
}
