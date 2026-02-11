import GSOM from '../../lib/model/growing_som.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Growing self-organizing map (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Growing_self-organizing_map',
	}
	const controller = new Controller(platform)
	let model = null

	const fitModel = () => {
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		const tilePred = model.predict(platform.testInput(4))
		platform.testResult(tilePred.map(v => v + 1))

		platform.centroids(
			model._node,
			model._node.map((v, i) => i + 1)
		)
		clusters.value = `${model.size} clusters`
	}

	const sf = controller.input.number({ min: 0, max: 1, step: 0.1, value: 0.1 })
	const lr = controller.input.number({ label: ' Learning rate ', min: 0, max: 10, step: 0.1, value: 0.1 })
	controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			model = new GSOM(sf.value, lr.value)
		})
		.step(fitModel)
	const clusters = controller.text('0 clusters')
}
