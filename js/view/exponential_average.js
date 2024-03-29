import { ExponentialMovingAverage, ModifiedMovingAverage } from '../../lib/model/exponential_average.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	platform.setting.ml.reference = {
		title: 'Moving average (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Moving_average',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		let model
		switch (method.value) {
			case 'exponential':
				model = new ExponentialMovingAverage(k.value)
				break
			case 'modified':
				model = new ModifiedMovingAverage(k.value)
				break
		}
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

	const method = controller.select(['exponential', 'modified']).on('change', () => {
		fitModel()
	})
	const k = controller.input.number({ label: 'k', min: 1, max: 100, value: 5 }).on('change', fitModel)
	controller.input.button('Calculate').on('click', fitModel)
}
