import XMeans from '../../lib/model/xmeans.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		author: '石岡 恒憲',
		title: 'クラスター数を自動決定するk-meansアルゴリズムの拡張について',
		year: 2000,
	}
	const controller = new Controller(platform)
	const model = new XMeans()

	controller.input.button('Step').on('click', () => {
		model.fit(platform.trainInput, 1)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{ line: true }
		)
		clusters.value = `${model.size} clusters`
	})
	const clusters = controller.text('0 clusters')
	clusters.element.style.padding = '0 10px'
	controller.input.button('Clear centroid').on('click', () => {
		model.clear()
		platform.init()
		clusters.value = `${model.size} clusters`
	})
}
