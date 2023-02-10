import ORCLUS from '../../lib/model/orclus.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'C. C. Aggarwal, P. S. Yu',
		title: 'Finding Generalized Projected Clusters in High Dimensional Spaces',
		year: 2000,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new ORCLUS(clusters.value, k0.value, l.value)

		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput).map(v => v + 1)
		platform.trainResult = pred
		const clstrs = [...new Set(pred)]
		clstrs.sort((a, b) => a - b)
		platform.centroids(model._s, clstrs, { line: true })
	}

	const clusters = controller.input.number({ label: ' clusters ', min: 1, max: 1000, value: 10 })
	const k0 = controller.input.number({ label: ' Initial clusters ', min: 1, max: 1000, value: 50 })
	const l = controller.input.number({ label: ' l ', min: 1, max: 1000, value: 2 })
	controller.input.button('Fit').on('click', fitModel)
}
