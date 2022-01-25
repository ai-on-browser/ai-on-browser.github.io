import PossibilisticCMeans from '../../lib/model/pcm.js'

import Matrix from '../../lib/util/matrix.js'

var dispPossibilisticCMeans = function (elm, platform) {
	let model = null

	const fitModel = (update, cb) => {
		platform.fit((tx, ty, pred_cb) => {
			if (update) {
				model.fit()
			}
			const pred = Matrix.fromArray(model.predict())
			pred_cb(pred.argmax(1).value.map(v => v + 1))
			platform.centroids(
				model._c,
				model._c.map((c, i) => i + 1),
				{ line: true }
			)
			cb && cb()
		})
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
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.fit((tx, ty) => {
			const m = +elm.select('[name=m]').property('value')
			model = new PossibilisticCMeans(m)
			model.init(tx)
		})
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
	dispPossibilisticCMeans(platform.setting.ml.configElement, platform)
}
