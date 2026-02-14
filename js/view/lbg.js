import LBG from '../../lib/model/lbg.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Linde-Buzo-Gray algorithm (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Linde%E2%80%93Buzo%E2%80%93Gray_algorithm',
	}
	const controller = new Controller(platform)
	const model = new LBG()

	controller.input.button('Step').on('click', () => {
		model.fit(platform.trainInput)
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
