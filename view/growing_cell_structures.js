import GrowingCellStructures from '../lib/model/growing_cell_structures.js'

var dispGrowingCellStructures = function (elm, platform) {
	let model = null

	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = new GrowingCellStructures()
		elm.select('[name=clusternumber]').text(model.size + ' clusters')
		platform.init()
	})
	slbConf.step(cb => {
		platform.fit((tx, ty, pred_cb) => {
			model.fit(tx)
			const pred = model.predict(tx)
			pred_cb(pred.map(v => v + 1))
		})
		platform.centroids(
			model._nodes,
			model._nodes.map((c, i) => i + 1),
			{
				line: true,
				duration: 10,
			}
		)
		platform.predict((px, pred_cb) => {
			const pred = model.predict(px)
			pred_cb(pred.map(v => v + 1))
		}, 4)
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
