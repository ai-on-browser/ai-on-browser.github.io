import DIANA from '../../lib/model/diana.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	const controller = new Controller(platform)
	let model = null

	const fitModel = cb => {
		if (!model) {
			model = new DIANA()
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = model.size
		cb && cb()
	}

	controller.input.button('Initialize').on('click', () => {
		model = null
		clusters.value = 0
	})
	controller.input.button('Step').on('click', () => {
		fitModel()
	})
	const clusters = controller.text({ label: ' Clusters: ' })
}
