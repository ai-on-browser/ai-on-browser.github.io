import LMCLUS from '../../lib/model/lmclus.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'R. Haralick, R. Harpaz',
		title: 'Linear manifold clustering in high dimensional spaces by stochastic search',
		year: 2007,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new LMCLUS(k.value, s.value, gamma.value)

		model.fit(platform.trainInput)
		const pred = model.predict().map(v => v + 1)
		platform.trainResult = pred
		clusters.value = model.size
	}

	const k = controller.input.number({ label: ' k ', min: 1, max: 1000, value: 2 })
	const s = controller.input.number({ label: ' s ', min: 1, max: 1000, value: 1.5, step: 0.1 })
	const gamma = controller.input.number({ label: ' gamma ', min: 0, max: 1, value: 0.4, step: 0.01 })
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}
