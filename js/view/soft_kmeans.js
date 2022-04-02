import SoftKMeans from '../../lib/model/soft_kmeans.js'

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

	elm.append('span').text('beta')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'b')
		.attr('max', 1000)
		.attr('min', 0)
		.attr('step', 0.1)
		.attr('value', 10)
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
		const b = +elm.select('[name=b]').property('value')
		model = new SoftKMeans(b)
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
