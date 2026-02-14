import GrowingNeuralGas from '../../lib/model/growing_neural_gas.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	platform.setting.ml.reference = {
		title: 'Neural gas (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Neural_gas',
	}
	const controller = new Controller(platform)
	let model = null

	const slbConf = controller.stepLoopButtons().init(() => {
		model = new GrowingNeuralGas(l.value, m.value)
		clusters.value = `${model.size} clusters`
		platform.init()
	})
	const clusters = controller.text('0 clusters')
	clusters.element.style.padding = '0 10px'
	const l = controller.input.number({ label: ' l ', max: 10, step: 0.1, value: 1 }).on('change', () => {
		model._l = l.value
	})
	const m = controller.input
		.number({ label: '*=', min: 0.0001, max: 1, step: 0.0001, value: 0.9999 })
		.on('change', () => {
			model._m = m.value
		})
	slbConf.step(cb => {
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		platform.centroids(
			model._nodes,
			model._nodes.map((c, i) => i + 1),
			{
				line: true,
				duration: 10,
			}
		)
		const ppred = model.predict(platform.testInput(4))
		platform.testResult(ppred.map(v => v + 1))
		l.value = model._l
		clusters.value = `${model.size} clusters`
		cb && setTimeout(cb, 10)
	})
}
