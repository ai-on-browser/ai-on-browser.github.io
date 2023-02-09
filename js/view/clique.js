import CLIQUE from '../../lib/model/clique.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'R. Agrawal, J. Gehrke, D. Gunopulos, P. Raghavan',
		title: 'Automatic subspace clustering of high dimensional data for data mining applications',
		year: 1998,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new CLIQUE(Array(platform.datas.dimension).fill(xi.value), threshold.value)
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		const tilePred = model.predict(platform.testInput(4))
		platform.testResult(tilePred.map(v => (v < 0 ? -1 : v + 1)))
		clusters.value = model.size
	}

	const xi = controller.input.number({ label: 'step', min: 0, max: 100, step: 0.1, value: 0.2 })
	const threshold = controller.input.number({ label: 'threshold', min: 0, max: 1, step: 0.01, value: 0.1 })
	controller.input.button('Fit').on('click', calc)
	const clusters = controller.text({ label: ' Clusters: ' })
}
