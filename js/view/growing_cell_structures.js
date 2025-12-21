import GrowingCellStructures from '../../lib/model/growing_cell_structures.js'
import Controller from '../controller.js'

var dispGrowingCellStructures = (elm, platform) => {
	const controller = new Controller(platform)
	let model = null

	const slbConf = controller.stepLoopButtons().init(() => {
		model = new GrowingCellStructures()
		elm.select('[name=clusternumber]').text(model.size + ' clusters')
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
		elm.select('[name=clusternumber]').text(model.size + ' clusters')
		cb && setTimeout(cb, 10)
	})
	elm.append('span').attr('name', 'clusternumber').style('padding', '0 10px').text('0 clusters')
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	dispGrowingCellStructures(platform.setting.ml.configElement, platform)
}
