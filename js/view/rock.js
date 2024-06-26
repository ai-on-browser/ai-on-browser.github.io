import ROCK from '../../lib/model/rock.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'S. Guha, R. Rastogi, K. Shim',
		title: 'ROCK: A Robust Clustering Algorithm for Categorical Attributes.',
		year: 2000,
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new ROCK(threshold.value, k.value)
		model.fit(platform.trainInput)
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
	}

	const threshold = controller.input.number({ label: ' threshold ', min: 0, max: 1, value: 0.95, step: 0.01 })
	const k = controller.input.number({ label: ' k ', min: 1, max: 100, value: 3 })
	controller.input.button('Fit').on('click', fitModel)
}
