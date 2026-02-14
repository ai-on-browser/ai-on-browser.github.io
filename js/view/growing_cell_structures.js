import GrowingCellStructures from '../../lib/model/growing_cell_structures.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	const controller = new Controller(platform)
	let model = null

	const slbConf = controller.stepLoopButtons().init(() => {
		model = new GrowingCellStructures()
		clusters.value = `${model.size} clusters`
		platform.init()
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
		clusters.value = `${model.size} clusters`
		cb && setTimeout(cb, 10)
	})
	const clusters = controller.text('0 clusters')
	clusters.element.style.padding = '0 10px'
}
