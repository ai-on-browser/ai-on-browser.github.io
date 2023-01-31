import HDBSCAN from '../../lib/model/hdbscan.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'The hdbscan Clustering Library',
		url: 'https://hdbscan.readthedocs.io/en/latest/how_hdbscan_works.html',
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new HDBSCAN(minClusterSize.value, minpts.value, metric.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = model.size
	}

	const metric = controller.select(['euclid', 'manhattan', 'chebyshev']).on('change', fitModel)
	const minClusterSize = controller.input
		.number({ label: 'min cluster size', min: 1, max: 100, value: 5 })
		.on('change', fitModel)
	const minpts = controller.input.number({ label: 'min pts', min: 2, max: 1000, value: 5 }).on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}
