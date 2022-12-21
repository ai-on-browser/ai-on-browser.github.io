import MutualKNN from '../../lib/model/mutual_knn.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'M. R. Brito, E. Chavez, A. J. Quiroz, J. E. Yukich',
		title: 'Connectivity of the mutual k-nearest-neighbor graph in clustering and outlier detection',
		year: 1997,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new MutualKNN(k.value)
		model.fit(platform.trainInput)
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = model.size
	}

	const k = controller.input.number({
		label: 'k',
		min: 1,
		max: 100,
		value: 10,
	})
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({
		label: ' Clusters: ',
	})
}
