import DTSCAN from '../../lib/model/dtscan.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'J. Kim, J. Cho',
		title: 'Delaunay Triangulation-Based Spatial Clustering Technique for Enhanced Adjacent Boundary Detection and Segmentation of LiDAR 3D Point Clouds',
		year: 2019,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new DTSCAN(minpts.value, threshold.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = new Set(pred).size
	}

	const minpts = controller.input.number({ label: 'min pts', min: 2, max: 1000, value: 5 }).on('change', fitModel)
	const threshold = controller.input
		.number({ label: 'threshold', min: 0, max: 10, step: 0.1, value: 1.0 })
		.on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}
