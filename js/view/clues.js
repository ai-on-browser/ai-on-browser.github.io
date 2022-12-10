import CLUES from '../../lib/model/clues.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'X. Wang, W. Qiu, R. H. Zamar',
		title: 'CLUES: A Non-parametric Clustering Method Based on Local Shrinking',
		year: 2007,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new CLUES(alpha.value)
		model.fit(platform.trainInput)
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = model.size
	}

	const alpha = controller.input.number({ label: 'alpha', min: 0.01, max: 10, step: 0.01, value: 0.05 })
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}
