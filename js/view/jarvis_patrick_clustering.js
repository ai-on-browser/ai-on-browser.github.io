import JarvisPatrickClustering from '../../lib/model/jarvis_patrick_clustering.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new JarvisPatrickClustering(k.value, t.value, metric.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		cluster.value = new Set(pred).size
	}

	const metric = controller.select(['euclid', 'manhattan', 'chebyshev']).on('change', fitModel)
	const k = controller.input.number({ label: 'k', min: 1, max: 100, value: 10 }).on('change', fitModel)
	const t = controller.input.number({ label: 't', min: 1, max: 100, value: 5 }).on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
	const cluster = controller.text({ label: ' Clusters: ' })
}
