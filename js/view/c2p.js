import C2P from '../../lib/model/c2p.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'A. Nanopoulos, Y. Theodoridis, Y. Manolopoulos',
		title: 'C2P: Clustering based on Closest Pairs',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new C2P(r.value, 100)
		model.fit(platform.trainInput)
		const pred = model.predict(k.value)
		platform.trainResult = pred.map(v => v + 1)
	}

	const r = controller.input.number({ label: ' r ', min: 1, max: 1000, value: 10 }).on('change', fitModel)
	const k = controller.input.number({ label: ' k ', min: 1, max: 1000, value: 3 }).on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
}
