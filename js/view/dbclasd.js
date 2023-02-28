import DBCLASD from '../../lib/model/dbclasd.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'X. Xu, M. Ester, H. P. Kriegel, J. Sander',
		title: 'A Distribution-Based Clustering Algorithm for Mining in Large Spatial Databases',
		year: 1998,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new DBCLASD()

		const pred = model.predict(platform.trainInput).map(v => v + 1)
		platform.trainResult = pred
		clusters.value = new Set(pred.filter(v => v > 0)).size
	}

	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}
