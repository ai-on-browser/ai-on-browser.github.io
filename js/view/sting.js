import STING from '../../lib/model/sting.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'W. Wang, J. Yang, R. R. Muntz',
		title: 'STING : A Statistical Information Grid Approach to Spatial Data Mining',
		year: 1997,
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new STING(c.value)
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = new Set(pred.filter(v => v >= 0)).size
		const tilePred = model.predict(platform.testInput(4))
		platform.testResult(tilePred.map(v => (v < 0 ? -1 : v + 1)))
	}

	const c = controller.input.number({ label: 'c', min: 0, max: 10000, value: 500 })
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}
