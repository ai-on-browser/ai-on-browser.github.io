import FuzzyCMeans from '../../lib/model/fuzzy_cmeans.js'

import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

var dispFuzzyCMeans = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	const fitModel = (update, cb) => {
		if (update) {
			model.fit()
		}
		const pred = Matrix.fromArray(model.predict())
		platform.trainResult = pred.argmax(1).value.map(v => v + 1)
		platform.centroids(
			model._c,
			model._c.map((c, i) => i + 1),
			{ line: true }
		)
		cb && cb()
	}

	elm.append('span').text('m')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'm')
		.attr('max', 10)
		.attr('min', 1.1)
		.attr('step', 0.1)
		.attr('value', 2)
	const addCentroid = () => {
		model.add()
		elm.select('[name=clusternumber]').text(model._c.length + ' clusters')
		platform.centroids(
			model._c,
			model._c.map((c, i) => i + 1),
			{ line: true }
		)
		fitModel(false)
	}
	const slbConf = controller.stepLoopButtons().init(() => {
		const m = +elm.select('[name=m]').property('value')
		model = new FuzzyCMeans(m)
		model.init(platform.trainInput)
		platform.init()

		addCentroid()
	})
	elm.append('input').attr('type', 'button').attr('value', 'Add centroid').on('click', addCentroid)
	elm.append('span').attr('name', 'clusternumber').style('padding', '0 10px').text('0 clusters')
	slbConf
		.step(cb => {
			fitModel(true, cb)
		})
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	dispFuzzyCMeans(platform.setting.ml.configElement, platform)
}
