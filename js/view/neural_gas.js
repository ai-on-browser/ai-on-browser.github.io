import NeuralGas from '../../lib/model/neural_gas.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Neural gas (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Neural_gas',
	}
	const controller = new Controller(platform)
	let model = new NeuralGas()

	const fitPoints = () => {
		const pred = model.predict(platform.testInput(4))
		platform.testResult(pred.map(v => v + 1))
		l.value = model._l
	}

	const slbConf = controller.stepLoopButtons().init(() => {
		model = new NeuralGas(l.value, m.value)
		clusters.value = model.size + ' clusters'
		platform.init()
	})
	controller.input.button('Add centroid').on('click', () => {
		model.add(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{ line: true }
		)
		fitPoints()
		clusters.value = model.size + ' clusters'
	})
	const clusters = controller.text('0 clusters')
	clusters.element.style.padding = '0 10px'
	const l = controller.input.number({ label: ' l ', max: 10, step: 0.1, value: 1 }).on('change', () => {
		model._l = l.value
	})
	const m = controller.input.number({ label: '*=', min: 0.01, max: 1, step: 0.01, value: 0.99 }).on('change', () => {
		model._m = m.value
	})
	slbConf.step(async () => {
		if (model.size === 0) {
			return
		}
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{ line: true, duration: 100 }
		)
		fitPoints()
		await new Promise(resolve => setTimeout(resolve, 100))
	})
}
